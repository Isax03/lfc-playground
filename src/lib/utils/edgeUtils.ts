import { Position, type InternalNode } from "@xyflow/svelte";

interface HandleCoordinates {
    x: number;
    y: number;
    position: Position;
    id: string;
}

function getHandleCoordinates(node: InternalNode): HandleCoordinates[] {
    const handles: HandleCoordinates[] = [];
    const handleBounds = node.internals.handleBounds?.source || [];

    handleBounds.forEach((handle) => {
        if (!handle.width || !handle.height) return;

        let offsetX = handle.width / 2;
        let offsetY = handle.height / 2;

        switch (handle.position) {
            case Position.Left:
                offsetX = 0;
                break;
            case Position.Right:
                offsetX = handle.width;
                break;
            case Position.Top:
                offsetY = 0;
                break;
            case Position.Bottom:
                offsetY = handle.height;
                break;
        }

        const x = node.internals.positionAbsolute.x + handle.x + offsetX;
        const y = node.internals.positionAbsolute.y + handle.y + offsetY;

        handles.push({
            x,
            y,
            position: handle.position,
            id: handle.id ?? "",
        });
    });

    return handles;
}

function getClosestHandles(
    nodeA: InternalNode,
    nodeB: InternalNode
): [HandleCoordinates, HandleCoordinates] {
    const handlesA = getHandleCoordinates(nodeA);
    const handlesB = getHandleCoordinates(nodeB);

    let minDistance = Infinity;
    let closestHandleA: HandleCoordinates = handlesA[0];
    let closestHandleB: HandleCoordinates = handlesB[0];

    handlesA.forEach((handleA) => {
        handlesB.forEach((handleB) => {
            const distance = Math.sqrt(
                Math.pow(handleA.x - handleB.x, 2) +
                    Math.pow(handleA.y - handleB.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestHandleA = handleA;
                closestHandleB = handleB;
            }
        });
    });

    return [closestHandleA, closestHandleB];
}

function getParams(
    nodeA: InternalNode,
    nodeB: InternalNode
): [number, number, Position, string] {
    const [handleA] = getClosestHandles(nodeA, nodeB);
    return [handleA.x, handleA.y, handleA.position, handleA.id];
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
    const [sx, sy, sourcePos, sourceHandle] = getParams(source, target);
    const [tx, ty, targetPos, targetHandle] = getParams(target, source);

    return {
        sx,
        sy,
        tx,
        ty,
        sourcePos,
        targetPos,
        sourceHandle,
        targetHandle,
    };
}
