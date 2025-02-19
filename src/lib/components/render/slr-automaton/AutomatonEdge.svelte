<script lang="ts">
    import { getEdgeParams } from "$lib/utils/edgeUtils";
    import {
        getBezierPath,
        getSmoothStepPath,
        getStraightPath,
        useEdges,
        useInternalNode,
        type EdgeProps,
    } from "@xyflow/svelte";
    import { mode } from "mode-watcher";

    type $$Props = EdgeProps;

    export let source: $$Props["source"];
    export let target: $$Props["target"];
    export let id: $$Props["id"];
    export let label: $$Props["label"] = undefined;
    export let data: $$Props["data"] = undefined;

    $: sourceNode = useInternalNode(source);
    $: targetNode = useInternalNode(target);
    const edges = useEdges();

    let edgePath: string | undefined;

    function getBidirectionalPath(
        sourceX: number,
        sourceY: number,
        targetX: number,
        targetY: number,
        curvature: number = 0.25
    ): string {
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;

        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Aumentato l'offset per creare un arco più ampio
        const offsetX = (-dy / length) * 50; // aumentato da 30 a 50
        const offsetY = (dx / length) * 50;

        const controlX = midX + offsetX;
        const controlY = midY + offsetY;

        return `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
    }

    function getSelfLoopPath(
        sourceX: number,
        sourceY: number,
        sourcePos: string
    ): string {
        const size = 40;
        const distance = 50;

        // Curva più elegante che si estende e ritorna dolcemente
        switch (sourcePos) {
            case "top":
                return `M ${sourceX} ${sourceY}
                  C ${sourceX} ${sourceY - distance},
                    ${sourceX + size} ${sourceY - distance},
                    ${sourceX + size} ${sourceY - size}
                  C ${sourceX + size} ${sourceY},
                    ${sourceX} ${sourceY},
                    ${sourceX} ${sourceY}`;
            case "right":
                return `M ${sourceX} ${sourceY}
                  C ${sourceX + distance} ${sourceY},
                    ${sourceX + distance} ${sourceY + size},
                    ${sourceX + size} ${sourceY + size}
                  C ${sourceX} ${sourceY + size},
                    ${sourceX} ${sourceY},
                    ${sourceX} ${sourceY}`;
            case "bottom":
                return `M ${sourceX} ${sourceY}
                  C ${sourceX} ${sourceY + distance},
                    ${sourceX - size} ${sourceY + distance},
                    ${sourceX - size} ${sourceY + size}
                  C ${sourceX - size} ${sourceY},
                    ${sourceX} ${sourceY},
                    ${sourceX} ${sourceY}`;
            default: // left
                return `M ${sourceX} ${sourceY}
                  C ${sourceX - distance} ${sourceY},
                    ${sourceX - distance} ${sourceY - size},
                    ${sourceX - size} ${sourceY - size}
                  C ${sourceX} ${sourceY - size},
                    ${sourceX} ${sourceY},
                    ${sourceX} ${sourceY}`;
        }
    }

    // Aggiungi questa funzione per calcolare il punto medio del path
    function getPathMidpoint(path: SVGPathElement): { x: number; y: number } {
        const length = path.getTotalLength();
        const midPoint = path.getPointAtLength(length / 2);
        return { x: midPoint.x, y: midPoint.y };
    }

    function calculateLabelOffset(
        sourceX: number,
        sourceY: number,
        targetX: number,
        targetY: number,
        isBidirectional: boolean
    ): { dx: number; dy: number } {
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const angle = Math.atan2(dy, dx);
        const degrees = angle * (180 / Math.PI);
        
        // Aumentato l'offset di base per le label
        const baseOffset = isBidirectional ? 40 : 25; // aumentato per gli archi bidirezionali
        
        if (isBidirectional) {
            const shouldBeAbove = parseInt(source) < parseInt(target);
            
            if (Math.abs(degrees) > 45 && Math.abs(degrees) < 135) {
                // Per archi verticali, sposta le label ancora più lateralmente
                return {
                    dx: shouldBeAbove ? baseOffset : -baseOffset,
                    dy: 0
                };
            } else {
                // Per archi orizzontali, sposta le label più in alto/basso
                return {
                    dx: 0,
                    dy: shouldBeAbove ? -baseOffset : baseOffset
                };
            }
        }
        
        // Per archi non bidirezionali, mantieni il comportamento precedente
        if (Math.abs(degrees) > 45 && Math.abs(degrees) < 135) {
            return {
                dx: baseOffset,
                dy: 0
            };
        }
        
        return {
            dx: 0,
            dy: -baseOffset
        };
    }

    let pathElement: SVGPathElement;
    let midPoint = { x: 0, y: 0 };
    let labelOffset = { dx: 0, dy: -10 };
    let isBidirectional: boolean;

    $: if (pathElement && edgePath) {
        midPoint = getPathMidpoint(pathElement);
    }

    $: {
        if ($sourceNode && $targetNode) {
            const edgeParams = getEdgeParams($sourceNode, $targetNode);
            
            // Verifica se l'arco è bidirezionale
            isBidirectional = $edges.some((e) => e.source === target && e.target === source);
            
            labelOffset = calculateLabelOffset(
                edgeParams.sx,
                edgeParams.sy,
                edgeParams.tx,
                edgeParams.ty,
                isBidirectional
            );

            // Verifica se è un self-loop
            const isSelfLoop = source === target;

            if (isSelfLoop) {
                edgePath = getSelfLoopPath(
                    edgeParams.sx,
                    edgeParams.sy,
                    edgeParams.sourcePos
                );
            } else if (
                $edges.some((e) => e.source === target && e.target === source)
            ) {
                edgePath = getBidirectionalPath(
                    edgeParams.sx,
                    edgeParams.sy,
                    edgeParams.tx,
                    edgeParams.ty
                );
            } else {
                if(data.shape === "bezier") {
                    edgePath = getBezierPath({
                        sourceX: edgeParams.sx,
                        sourceY: edgeParams.sy,
                        sourcePosition: edgeParams.sourcePos,
                        targetPosition: edgeParams.targetPos,
                        targetX: edgeParams.tx,
                        targetY: edgeParams.ty,
                    })[0];
                } else if(data.shape === "smoothstep") {
                    edgePath = getSmoothStepPath({
                        sourceX: edgeParams.sx,
                        sourceY: edgeParams.sy,
                        sourcePosition: edgeParams.sourcePos,
                        targetPosition: edgeParams.targetPos,
                        targetX: edgeParams.tx,
                        targetY: edgeParams.ty,
                    })[0];
                } else {
                    edgePath = getStraightPath({
                        sourceX: edgeParams.sx,
                        sourceY: edgeParams.sy,
                        targetX: edgeParams.tx,
                        targetY: edgeParams.ty,
                    })[0];
                }
            }
        } else {
            edgePath = undefined;
        }
    }
</script>

<svg class="svelte-flow__edge">
    <defs>
        <marker
            id="arrow-{id}"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
        >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={$mode === "dark" ? "#fff" : "#000"} />
        </marker>
    </defs>
    <path
        bind:this={pathElement}
        class="svelte-flow__edge-path"
        {id}
        d={edgePath}
        marker-end="url(#arrow-{id})"
        style="stroke: {$mode === "dark" ? "#fff" : "#000"};"
    />
    
    {#if edgePath && label && pathElement}
        <text
            x={midPoint.x + labelOffset.dx}
            y={midPoint.y + labelOffset.dy}
            text-anchor="middle"
            dominant-baseline="auto"
            class="font-mono fill-pink-400 font-bold text-2xl pointer-events-none"
        >
            <tspan>{label}</tspan>
        </text>
    {/if}
</svg>

<style>
</style>
