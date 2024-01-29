# join-lines

Join GeoJSON LineStrings together.

## Usage

```js
import joinLines from 'join-lines'
```

Given an array of GeoJSON LineString's, will find all that touch at endpoints and join them together.

### Parameters

-   `input` **[Array][3]** An array of GeoJSON LineString coordinates
-   `options` **[Object][4]?** 
    -   `options.preserveDirections` **[Object][4]** If true then no line will be flipped in the other direction, if false then this may happen. (optional, default `false`)
    -   `options.tolerance` **[Object][4]** Tolerance allowed to still join endpoints which are close but not exactly touching. (optional, default `0`)

Returns **[Array][3]** An array of joined LineString coordinates.

[3]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[4]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
