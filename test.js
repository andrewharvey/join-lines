'use strict';

const joinLines = require('./');
const test = require('tape');

// |-->|-->|
// |------>|
test('join two ordered touching lines', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[1, 0], [2, 0]]
    ], {
        preserveDirections: true
    });
    t.same(result, [
        [[0, 0], [1, 0], [2, 0]]
    ]);
    t.end();
});

// |-->||-->|
// |------->|
test('join two ordered touching lines with tolerance', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[2, 0], [3, 0]]
    ], {
        preserveDirections: true,
        tolerance: 1
    });
    t.same(result, [
        [[0, 0], [1, 0], [3, 0]]
    ]);
    t.end();
});

// |-->|-->|-->|
// |---------->|
test('join three ordered touching lines', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[1, 0], [2, 0]],
        [[2, 0], [3, 0]]
    ], {
        preserveDirections: true
    });
    t.same(result, [
        [[0, 0], [1, 0], [2, 0], [3, 0]]
    ]);
    t.end();
});

// |-->|-->|-->|-->|
// |-------------->|
test('join four ordered touching lines', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[1, 0], [2, 0]],
        [[2, 0], [3, 0]],
        [[3, 0], [4, 0]]
    ], {
        preserveDirections: true
    });
    t.same(result, [
        [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
    ]);
    t.end();
});

// |-->|-->||-->|-->|
// |--------------->|
test('join four ordered touching lines with tolerance', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[1, 0], [2, 0]],
        [[3, 0], [4, 0]],
        [[4, 0], [5, 0]]
    ], {
        preserveDirections: true,
        tolerance: 1
    });
    t.same(result, [
        [[0, 0], [1, 0], [2, 0], [4, 0], [5, 0]]
    ]);
    t.end();
});

// |-->| |-->|
// |-->| |-->|
test('no joins', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[2, 0], [3, 0]]
    ], {
        preserveDirections: true
    });
    t.same(result, [
        [[0, 0], [1, 0]],
        [[2, 0], [3, 0]]
    ]);
    t.end();
});

// |-->|-->| |-->|
// |------>| |-->|
test('two lines joined, one not', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[1, 0], [2, 0]],
        [[3, 0], [4, 0]]
    ], {
        preserveDirections: true
    });
    t.same(result, [
        [[0, 0], [1, 0], [2, 0]],
        [[3, 0], [4, 0]]
    ]);
    t.end();
});

// |-->|<--|
// |-->|<--|
test('two lines opposite directions not joined with preserveDirections', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[2, 0], [1, 0]]
    ], {
        preserveDirections: true
    });
    t.same(result, [
        [[0, 0], [1, 0]],
        [[2, 0], [1, 0]]
    ]);
    t.end();
});

// |-->|-->|<--|
// |------>|<--|
test('two lines in same direction joined, one opposite direction not joined with preserveDirections', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[1, 0], [2, 0]],
        [[3, 0], [2, 0]]
    ], {
        preserveDirections: true
    });
    t.same(result, [
        [[0, 0], [1, 0], [2, 0]],
        [[3, 0], [2, 0]]
    ]);
    t.end();
});

// |-->|-->|
// |-->/
//
// |------>|
// |-->/
test('three way join', (t) => {
    const result = joinLines([
        [[0, 0], [1, 0]],
        [[1, 0], [2, 0]],
        [[1, -1], [1, 0]]
    ], {
        preserveDirections: true
    });
    t.same(result, [
        [[0, 0], [1, 0], [2, 0]],
        [[1, -1], [1, 0]]
    ]);
    t.end();
});
