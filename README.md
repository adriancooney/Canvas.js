#Documentation#
###By Adrian Cooney###

##Overview##
Canvas.js is a simple library to make your life easier with the canvas element. It simplifies layering, simple shape drawing and the ability to create plugins easily.

##API##
###Globals###
`layers` - An array containing all the layers.
`thisLayer` - The current layer.

###Methods###
####CanvasRenderingContext2D####
The methods on the canvas after its context has been set to '2d'.

#####`CanvasRenderingContext2D.circle(x, y, radius [, fillStyle])`
_Params:_ xPosition, yPosition, radius, fillStyle (optional, defaults to black)

#####`CanvasRenderingContext2D.empty()`
Empty the current layer.

Example:
    //Create a layer
    newLayer();
    
    //Draw on it
    thisLayer.circle(20, 30, 10);
    
#In progress#
