function extractBetweenTags(
    text: string,
    startTag: string,
    endTag: string,
) {
    try {
        // Find start position
        const startIndex = text.indexOf(startTag);
        if (startIndex === -1) return text;

        // Calculate content boundaries
        let contentStart = startIndex + startTag.length;
        let contentEnd;

        if (endTag) {
            contentEnd = text.indexOf(endTag, contentStart);
            if (contentEnd === -1) return text;
        } else {
            // Find next newline for self-closing tags
            contentEnd = text.indexOf('\n', contentStart);
            if (contentEnd === -1) contentEnd = text.length;
        }

        // Extract content
        return text.substring(contentStart, contentEnd).trim();
    } catch (error) {
        throw new Error(`Error parsing content between tags ${startTag} ${endTag}: ${error}`);
    }
}

function splitThinking(text: string, startTag: string, endTag: string): { think: string, finalAnswer: string } {
    let think = "";
    let answer = "";
    const st = text.split(endTag);
    if (st.length > 1) {
        think = extractBetweenTags(text, startTag, endTag);
        answer = st[1].trim()
    } else {
        answer = text
    }
    return { think: think, finalAnswer: answer }
}

function createAwaiter<T = boolean>() {
    let resolveFn: (value: T) => void;
    let rejectFn: (reason?: any) => void;

    const promise = new Promise<T>((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });

    return {
        awaiter: promise,
        unblock: resolveFn!,
        reject: rejectFn!
    };
}

function slugify(input: string) {
    if (!input)
        return '';
    // make lower case and trim
    var slug = input.toLowerCase().trim();
    // remove accents from charaters
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // replace invalid chars with spaces
    slug = slug.replace(/[^a-z0-9\s-]/g, ' ').trim();
    // replace multiple spaces or hyphens with a single hyphen
    slug = slug.replace(/[\s-]+/g, '-');
    return slug;
}

function moveKey(
    myObject: Record<string, any>,
    key: string,
    direction: "up" | "down"
): Record<string, any> {
    // 1. Get the current keys order
    const keys = Object.keys(myObject);

    // 2. Find the index of the key we want to move
    const currentIndex = keys.indexOf(key);

    // If key doesn't exist, return the object as is (or throw error)
    if (currentIndex === -1) {
        return myObject;
    }

    // 3. Calculate the target index
    // "up" usually means index - 1 (visually higher in lists)
    // "down" means index + 1
    let targetIndex = currentIndex;

    if (direction === "up") {
        targetIndex = currentIndex - 1;
    } else {
        targetIndex = currentIndex + 1;
    }

    // 4. Boundary checks: 
    // If moving "up" from the top, move to the bottom.
    // If moving "down" from the bottom, move to the top.
    // (You can change this logic to simply 'return' if you prefer to block wrapping)
    if (targetIndex < 0) {
        targetIndex = keys.length - 1;
    } else if (targetIndex >= keys.length) {
        targetIndex = 0;
    }

    // 5. Swap the keys in the array
    // We create a copy to avoid mutating the original array reference if it were external
    const newKeys = [...keys];
    [newKeys[currentIndex], newKeys[targetIndex]] = [newKeys[targetIndex], newKeys[currentIndex]];

    // 6. Rebuild the object with the new order
    const result: Record<string, any> = {};
    for (const k of newKeys) {
        result[k] = myObject[k];
    }

    return result;
}

export {
    extractBetweenTags,
    splitThinking,
    createAwaiter,
    slugify,
    moveKey,
}