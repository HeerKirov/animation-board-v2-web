interface SegmentTreeNode<V> {
    begin: number
    end: number
    left: SegmentTreeNode<V> | null
    right: SegmentTreeNode<V> | null
    parent: SegmentTreeNode<V> | null
    value: V
}

interface SegmentTreePrintNode<V> {
    begin: number
    end: number
    left: SegmentTreePrintNode<V> | null
    right: SegmentTreePrintNode<V> | null
    value: string
}

export interface MarkSegmentTree {
    mark(begin: number, end: number)
    query(begin: number, end: number): boolean
    print()
}

export function createMarkST(begin: number = 0, end: number = 100): MarkSegmentTree {
    const root: SegmentTreeNode<boolean> = {begin, end, left: null, right: null, parent: null, value: false}

    const mark = (begin: number, end: number) => {
        const queue = [root]
        for(let i = 0; i < queue.length; ++i) {
            const node = queue[i]
            if(begin <= node.begin && end >= node.end) {
                //要mark的区间完整覆盖了当前node，将其标记为true并不再递推此node
                node.value = true
            }else if(begin < node.end && end > node.begin) {
                //要mark的区间部分覆盖了当前node，于是继续拆分当前node的子区间并向下递推
                const mid = Math.ceil((node.begin + node.end) / 2)
                if(begin < mid && end > node.begin) {
                    //在左区间存在任意覆盖
                    queue.push(node.left ?? (node.left = {begin: node.begin, end: mid, left: null, right: null, parent: node, value: false}))
                }
                if(begin < node.end && end > mid) {
                    //在右区间存在任意覆盖
                    queue.push(node.right ?? (node.right = {begin: mid, end: node.end, left: null, right: null, parent: node, value: false}))
                }
            }//else要mark的区间与当前node完全不重合，不做任何标记并不再递推此node
        }
        for(let i = queue.length - 1; i >= 0; --i) {
            const node = queue[i]
            if(node.parent != null && !node.parent.value && node.parent.left != null && node.parent.right != null && node.parent.left.value && node.parent.right.value) {
                const parent = node.parent
                parent.value = true
                parent.left = null
                parent.right = null
            }
        }
    }

    const query = (begin: number, end: number): boolean => {
        const queue = [root]
        while (queue.length > 0) {
            const [node] = queue.splice(0, 1)
            if(end > node.begin && begin < node.end) {
                //此区间与查询区间存在任意重合
                if(node.value) {
                    //此区间标记为true，表示此区间已被完全覆盖，那么查询区间必定存在any覆盖
                    return true
                }else{
                    //此区间没有标记为true，这不能表示区间完全无覆盖，那么继续向下查询其子节点，只有子节点不存在时才能表示完全无覆盖
                    if(node.left != null) {
                        queue.push(node.left)
                    }
                    if(node.right != null) {
                        queue.push(node.right)
                    }
                }
            }
        }
        //如果前面没有return，则可以表示区间内没有任何子区间被覆盖
        return false
    }

    const print = () => {
        let queue: SegmentTreePrintNode<boolean>[][] = [[toPrintNode(root)]]
        for(let i = 0; i < queue.length; ++i) {
            let currentQueue: SegmentTreePrintNode<boolean>[] = queue[i]
            let nextQueue: SegmentTreePrintNode<boolean>[] | null = null
            for(const node of currentQueue) {
                if(nextQueue != null) {
                    const mid = Math.ceil((node.begin + node.end) / 2)
                    if(node.end - node.begin > 1) {
                        nextQueue.push(
                            node.left ?? {begin: node.begin, end: mid, left: null, right: null, value: '-'},
                            node.right ?? {begin: mid, end: node.end, left: null, right: null, value: '-'}
                        )
                    }else{
                        nextQueue.push({begin: node.begin, end: node.begin, left: null, right: null, value: ' '})
                    }
                }else if(node.end - node.begin > 1) {
                    const mid = Math.ceil((node.begin + node.end) / 2)
                    nextQueue = [
                        node.left ?? {begin: node.begin, end: mid, left: null, right: null, value: '-'},
                        node.right ?? {begin: mid, end: node.end, left: null, right: null, value: '-'}
                    ]
                }
            }
            if(nextQueue != null) {
                queue.push(nextQueue)
            }
        }
        for(let i = 0; i < queue.length; ++i) {
            console.log(`${i + 1}: ${queue[i].map(n => n.value + (n.end > n.begin ? Array(n.end - n.begin - 1).fill(' ').join('') : '')).join('')}`)
        }
    }

    function toPrintNode(node: SegmentTreeNode<boolean>): SegmentTreePrintNode<boolean> {
        return {
            begin: node.begin,
            end: node.end,
            left: node.left ? toPrintNode(node.left) : null,
            right: node.right ? toPrintNode(node.right) : null,
            value: `${node.value ? 1 : 0}`
        }
    }

    return {mark, query, print}
}
