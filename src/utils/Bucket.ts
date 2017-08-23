// Bucket.ts - Buckets Implementation (sr229@ClaraIO)

/**
 * Class to handle volatile storage or smth else.
 */
export class Bucket {
    /**
     * @param {Number} size the size of the bucket
     * @param {Number} duration how long would the bucket exist
     */
    constructor (size: Number , duration: Number) {
        this.size = size;
        this.duration = duration;

        if (isNaN(size)) {
            throw new Error("size is not a number");
        }
        if (isNaN(duration)) {
            throw new Error("size is not a number");
        }
    }
}
