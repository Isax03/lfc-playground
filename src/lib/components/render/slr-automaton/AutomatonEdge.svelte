<script lang="ts">
    import { getEdgeParams } from "$lib/utils/edgeUtils";
    import {
        getBezierPath,
        useEdges,
        useInternalNode,
        type EdgeProps,
    } from "@xyflow/svelte";

    type $$Props = EdgeProps;

    export let source: $$Props["source"];
    export let target: $$Props["target"];
    export let id: $$Props["id"];

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

        // Calcola il vettore perpendicolare
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Offset perpendicolare
        const offsetX = (-dy / length) * 30;
        const offsetY = (dx / length) * 30;

        // Il punto di controllo è spostato perpendicolarmente alla linea
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

    $: {
        if ($sourceNode && $targetNode) {
            const edgeParams = getEdgeParams($sourceNode, $targetNode);

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
                edgePath = getBezierPath({
                    sourceX: edgeParams.sx,
                    sourceY: edgeParams.sy,
                    sourcePosition: edgeParams.sourcePos,
                    targetPosition: edgeParams.targetPos,
                    targetX: edgeParams.tx,
                    targetY: edgeParams.ty,
                })[0];
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
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
        </marker>
    </defs>
    <path
        class="svelte-flow__edge-path"
        {id}
        d={edgePath}
        marker-end="url(#arrow-{id})"
        style="stroke: azure;"
    />
</svg>

<style>
</style>
