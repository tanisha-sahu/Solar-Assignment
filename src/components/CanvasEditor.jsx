import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';

// Helper to generate unique IDs for shapes
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

/* ---------- Reusable UI Components (unchanged) ---------- */
const Icon = ({ path }) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>;
const icons = {
    select: <Icon path={<><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="M13 13l6 6" /></>} />, pen: <Icon path={<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />} />, eraser: <Icon path={<path d="M16 3H8L3 8l8 8h8l5-5-8-8z" />} />, rect: <Icon path={<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />} />, circle: <Icon path={<circle cx="12" cy="12" r="10" />} />, text: <Icon path={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />, undo: <Icon path={<><path d="M21 7v6h-6" /><path d="M3.25 13A9 9 0 0 0 12 21a9 9 0 0 0 9-9" /></>} />, redo: <Icon path={<><path d="M3 17v-6h6" /><path d="M20.75 11A9 9 0 0 0 12 3a9 9 0 0 0-9 9" /></>} />, trash: <Icon path={<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14H5V6m3 0V4h8v2" /></>} />, export: <Icon path={<><path d="M21 15v4H3v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} />
};
const ToolButton = ({ active, onClick, label, icon, colorClass = "bg-blue-600", disabled = false }) => <button onClick={onClick} disabled={disabled} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-150 text-sm h-10 ${active ? `${colorClass} text-white shadow-md` : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} title={label}>{icon}<span className="hidden sm:inline">{label}</span></button>;

const LOCAL_STORAGE_KEY = "konvaCanvasState";

/* ---------- Shape Component to render different Konva shapes ---------- */
const ShapeComponent = ({ shapeProps, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && trRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const commonProps = {
        ...shapeProps,
        onClick: onSelect,
        onTap: onSelect,
        ref: shapeRef,
        draggable: true,
        onDragEnd: (e) => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() }),
        onTransformEnd: () => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1); node.scaleY(1);
            onChange({
                ...shapeProps,
                x: node.x(), y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
                rotation: node.rotation(),
            });
        },
    };

    let shape;
    switch (shapeProps.type) {
        case 'rect': shape = <Rect {...commonProps} />; break;
        case 'circle': shape = <Circle {...commonProps} radius={shapeProps.width / 2} />; break;
        case 'line': shape = <Line {...commonProps} draggable={false} />; break;
        case 'text':
            shape = (
                <Text
                    {...commonProps}
                    onDblClick={() => {
                        const newText = prompt("Enter new text:", shapeProps.text);
                        if (newText) onChange({ ...shapeProps, text: newText });
                    }}
                />
            );
            break;
        default: return null;
    }

    return (
        <>
            {shape}
            {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox} />}
        </>
    );
};

/* ---------- Main Canvas Editor Component ---------- */
const CanvasEditor = () => {
    const [activeTool, setActiveTool] = useState('select');
    const [shapes, setShapes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [history, setHistory] = useState([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const isDrawing = useRef(false);
    const stageRef = useRef(null);
    const containerRef = useRef(null);
    const layerRef = useRef(null);
    
    const [brushSize, setBrushSize] = useState(6);
    const [brushColor, setBrushColor] = useState('#000000');
    const [fillColor, setFillColor] = useState('#ffffff');
    
    useEffect(() => {
        const savedShapes = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedShapes) {
            const parsedShapes = JSON.parse(savedShapes);
            setShapes(parsedShapes);
            setHistory([parsedShapes]);
            setHistoryIndex(0);
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        setCanvasSize({ width: container.offsetWidth, height: container.offsetHeight });
        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setCanvasSize({ width, height });
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const pushToHistory = useCallback((currentShapes) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentShapes);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentShapes));
    }, [history, historyIndex]);
    
    // <<< FIX: The entire drawing logic is updated for real-time performance
    const handleMouseDown = (e) => {
        if (activeTool === 'select' || isDrawing.current) return;
        
        const stage = e.target.getStage();
        if (e.target !== stage) return;

        isDrawing.current = true;
        const pos = stage.getPointerPosition();
        
        const isEraser = activeTool === 'eraser';
        const newShape = {
            id: generateId(),
            type: 'line',
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: isEraser ? '#ffffff' : brushColor,
            strokeWidth: isEraser ? brushSize + 4 : brushSize,
            globalCompositeOperation: 'source-over',
            listening: false,
        };
        
        setShapes(prevShapes => [...prevShapes, newShape]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current) return;
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        setShapes(prevShapes => {
            const lastShape = prevShapes[prevShapes.length - 1];
            const newPoints = lastShape.points.concat([point.x, point.y]);
            const updatedLastShape = { ...lastShape, points: newPoints };
            return [...prevShapes.slice(0, -1), updatedLastShape];
        });
    };

    const handleMouseUp = () => {
        if (isDrawing.current) {
            isDrawing.current = false;
            pushToHistory(shapes);
        }
    };
    // <<< END FIX

    const addShape = (type) => {
        const stage = stageRef.current;
        if (!stage) return;
        const centerX = stage.width() / 2;
        const centerY = stage.height() / 2;

        let newShape;
        const common = { id: generateId(), x: centerX, y: centerY, stroke: brushColor, strokeWidth: 3, fill: fillColor };
        if (type === 'rect') newShape = { ...common, type: 'rect', width: 150, height: 100 };
        if (type === 'circle') newShape = { ...common, type: 'circle', width: 100, height: 100 };
        if (type === 'text') newShape = { ...common, type: 'text', text: 'Edit Me', fontSize: 32, fill: brushColor };
        
        const newShapes = [...shapes, newShape];
        setShapes(newShapes);
        pushToHistory(newShapes);
        setActiveTool('select');
    };

    const undo = () => { if (historyIndex > 0) { const newIndex = historyIndex - 1; setHistoryIndex(newIndex); setShapes(history[newIndex]); }};
    const redo = () => { if (historyIndex < history.length - 1) { const newIndex = historyIndex + 1; setHistoryIndex(newIndex); setShapes(history[newIndex]); }};
    const clearCanvas = () => { setShapes([]); pushToHistory([]); };
    const deleteSelected = () => { if (!selectedId) return; const newShapes = shapes.filter(s => s.id !== selectedId); setShapes(newShapes); pushToHistory(newShapes); setSelectedId(null); };
    const exportAsPNG = () => { const uri = stageRef.current.toDataURL(); const link = document.createElement('a'); link.download = 'canvas.png'; link.href = uri; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    
    return (
        <div className="w-full h-screen flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-900">
            <div className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl shadow-lg flex flex-wrap justify-center items-center gap-4 mb-4">
                {/* Toolbar sections */}
                <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-900 p-1 rounded-lg"><ToolButton active={activeTool === 'select'} onClick={() => setActiveTool('select')} label="Select" icon={icons.select} /><ToolButton active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} label="Pen" icon={icons.pen} /><ToolButton active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} label="Eraser" icon={icons.eraser} /></div>
                <div className="flex items-center gap-2"><ToolButton onClick={() => addShape('rect')} label="Rectangle" icon={icons.rect} colorClass="bg-green-600" /><ToolButton onClick={() => addShape('circle')} label="Circle" icon={icons.circle} colorClass="bg-green-600" /><ToolButton onClick={() => addShape('text')} label="Text" icon={icons.text} colorClass="bg-green-600" /></div>
                <div className="flex items-center gap-3"><div className="flex flex-col text-xs text-gray-700 dark:text-gray-200 items-center">Pen<input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-8 h-8 rounded" /></div><div className="flex flex-col text-xs text-gray-700 dark:text-gray-200 items-center">Fill<input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-8 h-8 rounded" /></div><div className="flex flex-col text-xs text-gray-700 dark:text-gray-200 items-center">Size<input type="range" min="1" max="80" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value, 10))} /></div></div>
                <div className="flex items-center gap-2"><ToolButton onClick={deleteSelected} label="Delete" icon={icons.trash} colorClass="bg-red-500" disabled={!selectedId} /><ToolButton onClick={undo} label="Undo" icon={icons.undo} disabled={historyIndex <= 0} /><ToolButton onClick={redo} label="Redo" icon={icons.redo} disabled={historyIndex >= history.length - 1} /><ToolButton onClick={exportAsPNG} label="Export" icon={icons.export} colorClass="bg-purple-600" /><button onClick={clearCanvas} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm h-10 bg-gray-600 hover:bg-gray-700 text-white">Clear All</button></div>
            </div>

            <div ref={containerRef} className="w-full flex-grow bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <Stage
                    ref={stageRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
                >
                    <Layer ref={layerRef}>
                        <Rect
                            x={0} y={0} width={canvasSize.width} height={canvasSize.height}
                            fill="white" listening={false}
                        />
                        {shapes.map((shape) => (
                            <ShapeComponent
                                key={shape.id}
                                shapeProps={shape}
                                isSelected={shape.id === selectedId}
                                onSelect={() => {
                                    if (shape.listening !== false) {
                                        setSelectedId(shape.id);
                                    }
                                }}
                                onChange={(newAttrs) => {
                                    const newShapes = shapes.map(s => s.id === newAttrs.id ? newAttrs : s);
                                    setShapes(newShapes);
                                    pushToHistory(newShapes);
                                }}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

export default CanvasEditor;