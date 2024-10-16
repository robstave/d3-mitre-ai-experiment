# Fix the Lines


https://jsfiddle.net/624ocLhy/2/



The line between values is thicker and red.  That looks good but stops at 12, can you make it connect to the first value again so it looks finished

# Result

Certainly! I'll modify the code to make the line connect back to the first value, creating a closed shape. This will indeed make the chart look more finished and complete.


 

I've made a key change to close the shape of the radar chart:

1. Modified the line generator to use `curveLinearClosed`:

```javascript
const line = d3.lineRadial()
    .angle((d, i) => angleScale(i))
    .radius(d => radiusScale(d.value))
    .curve(d3.curveLinearClosed);  // Use curveLinearClosed to close the shape
```

The `curveLinearClosed` curve type in D3.js automatically closes the shape by connecting the last point back to the first point. This creates a complete, closed polygon for our radar chart.

With this change, the red line will now form a closed shape, connecting the last data point (TA0040: Impact) back to the first one (TA0001: Initial Access). This gives the chart a more finished and polished look.

All other aspects of the chart remain the same, including:
- The horizontal labels
- The axes from the center to each data point
- The dots at each data point
- The background circular grid

This modification completes the radar chart, making it look more cohesive and finished. The closed shape also helps in visualizing the overall "footprint" of the data across all tactics.

Is there anything else you'd like me to adjust or explain about the chart?