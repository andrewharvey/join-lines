'use strict';

const KDBush = require('kdbush');

module.exports = joinLines;
module.exports.default = joinLines;

/**
 * Given an array of LineString's, will find all that touch at endpoints and join them together.
 *
 * @param {Array} input An array of GeoJSON LineString coordinates
 * @param {Object} [options]
 * @param {Object} [options.preserveDirections=false] If true then no line will be flipped in the other direction, if false then this may happen.
 * @param {Object} [options.tolerance=0] Tolerance allowed to still join endpoints which are close but not exactly touching.
 * @return {Array} An array of joined LineString coordinates.
 */
function joinLines(input, options) {
    const tolerance = options && options.tolerance || 0;

    // startEndPoints is a flat array of line 1 start, line 1 end, line 2 start, line 2 end, etc.
    const startEndPoints = [];
    input.forEach((coordinates) => {
        const start = coordinates[0];
        const end = coordinates[coordinates.length - 1];

        startEndPoints.push(start);
        startEndPoints.push(end);
    });

    // create an KDBush index of start-end points for each LineString
    const startEndPointIndex = new KDBush(startEndPoints);

    // a list of join instructions we need to fulfill
    // a join instruction has a key "matchKey" which is a 0 (start of line) or
    // 1 (end of line) concatenated with the index of the line we are joining from.
    // The value is an object consisting of fromLine (index of from), toLine (index of to),
    // fromStart (a boolean, true is start of the line, false is end of the line) and
    // toStart (as fromStart).
    //
    // For example join instructions could look like:
    // {
    //   '00': { fromLine: 0, fromStart: false, toLine: 1, toStart: true },
    //   '11': true
    // }
    //
    // The 00 key means this join is the start of the line 0.
    // The 11 key means this join is the end of line 1.
    // The value of 00, means join from line 0 to line 1, specifically the end of line 0 to the start of line 1
    // The value of 11, is just a placeholder to mark that we don't need this instruction (in this case it's redundant).
    const joinInstructions = {};

    // for each start-end point find all other start-end points within the tolerance and log a join instruction
    startEndPoints.forEach((startEndPoint, fromIndex) => {
        const nearPoints = startEndPointIndex.within(startEndPoint[0], startEndPoint[1], tolerance);

        nearPoints.forEach((toIndex) => {
            // found a match for fromIndex -> toIndex

            if (
                fromIndex !== toIndex &&
                Math.floor(fromIndex / 2) !== Math.floor(toIndex / 2)
            ) { // skip self point matches and self line matches
                // a potential join for line from start/end with line to start/end
                const fromLine = Math.floor(fromIndex / 2);
                const fromStart = (fromIndex % 2) === 0; // boolean is it start point or not
                const toLine = Math.floor(toIndex / 2);
                const toStart = (toIndex % 2) === 0; // boolean is it start point or not

                // since a start-end can only be involved in one join, we keep track and skip any
                // joins which would break this promise

                if (options && options.preserveDirections) {
                    if (!fromStart && toStart) { // end to start
                    } else {
                        // skip all others as they wouldn't preseve the line directions
                        return;
                    }
                }

                const matchKeyFrom = (fromStart ? '1' : '0') + fromLine;
                const matchKeyTo = (toStart ? '1' : '0') + toLine;

                if (!joinInstructions[matchKeyFrom] && !joinInstructions[matchKeyTo]) {

                    if (((`1${toLine}`) in joinInstructions) || ((`0${toLine}`) in joinInstructions)) {
                        // skip joining back to self in a loop
                    } else {
                        joinInstructions[matchKeyFrom] = {
                            fromLine,
                            fromStart,
                            toLine,
                            toStart
                        };

                        // still mark this as being involved in a join to prevent it being used again
                        joinInstructions[matchKeyTo] = true;
                    }
                }
            }
        });
    });

    // when a join is made, keep track of which original segments have been
    // joined so that future join instructions can be processed
    const joinLog = {};

    const outputLines = [];

    const inputsJoined = {};

    Object.values(joinInstructions).forEach((instruction) => {
        if (typeof instruction === 'object') { // skip any boolean entries as which were marked as duplicates previously
            if (!instruction.fromStart && instruction.toStart) { // end to start, no need to swap directions
                // keep track if this join is joining new segments or segments already joined
                let replaceOutputIndex = null;

                inputsJoined[instruction.fromLine] = true;
                inputsJoined[instruction.toLine] = true;

                // check if this line has been joined before, if it has then use the joined line instead
                let from;
                if (instruction.fromLine in joinLog) {
                    replaceOutputIndex = joinLog[instruction.fromLine];
                    from = outputLines[replaceOutputIndex];
                } else {
                    from = input[instruction.fromLine];
                }

                let to;
                if (instruction.toLine in joinLog) {
                    replaceOutputIndex = joinLog[instruction.toLine];
                    to = outputLines[replaceOutputIndex];
                } else {
                    to = input[instruction.toLine];
                }

                const outputLine = from.concat(to.slice(1));

                let outputLineIndex;
                if (replaceOutputIndex !== null) {
                    outputLineIndex = replaceOutputIndex;
                    outputLines[replaceOutputIndex] = outputLine;
                } else {
                    outputLineIndex = outputLines.length;
                    outputLines.push(outputLine);
                }


                // add this join to the join log
                if (!(instruction.fromLine in joinLog)) {
                    joinLog[instruction.fromLine] = outputLineIndex;
                }
                if (!(instruction.toLine in joinLog)) {
                    joinLog[instruction.toLine] = outputLineIndex;
                }
            }
        }
    });

    input.forEach((coordinates, index) => {
        if (index in inputsJoined) {
            // this input line was joined already
        } else {
            // this input line was not joined, need to add it
            outputLines.push(coordinates);
        }
    });

    return outputLines;
}
