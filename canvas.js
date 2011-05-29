var Canvas = function() {
	var canvasWrapper, canvas, currentPosition;
	
    //Create the wrapper
	canvasWrapper = (document.getElementById("easel")) ? document.getElementById("easel") : document.createElement("div");
	canvasWrapper.id = "easel";
    
	canvas = document.createElement("canvas");

    //Add to the document
	document.body.appendChild(canvasWrapper);
	canvasWrapper.appendChild(canvas);
	
    //Set the current position of the canvas for ID'ing
    currentPosition = positionOf(canvas, canvasWrapper.childNodes);
    
    //Set the layer's id
	canvas.id = "layer-" + currentPosition;
        
    //Add the stackablity
    canvas.style.position = "absolute";
    canvas.style.zIndex = currentPosition;
    
    //Returnt the canvas context (the .ctx method is defined in the Canvas.context)
    canvas = canvas.ctx();

    //Update layer information
	layers.push(canvas); //Push to the layer store
	thisLayer = canvas; //Set the current layer
        
	return canvas;
};

/**
 ** Canvas.
 ** The canvas variable is split up into two parts
 ** 	Canvas.context which is for editing the canvas when in context
 ** 	Canvas.element which is for editing the canvas node
 ** 	Canvas.window which is for global functions
 ** These sub categories are then extended to the window's canvas API
 ** 	Canvas.context => CanvasRenderingContext2D
 ** 	Canvas.element => HTMLCanvasElement
 ** 	Canvas.window => window
 ** And now we have access to all functions, so basically, the Canvas
 ** function is just creating or getting an element. Hooray!

 ** Globals
 ** 	thisLayer -- The current layer [CanvasRenderContext2d]
 ** 	layers -- the layer board [array]
 **/

Canvas.extend = function( host, obj) {
	for ( var i in host ) {
		// Put the host into the object
		obj[i] = host[i];
	}
	return obj;
};


Canvas.window = {
    /** Global Variables **/
    thisLayer: undefined,
    layers: [],
    
    whatIs: function(data, couldBe) {
        if(!data) {
            return undefined;
        } else {
                if( typeof data == "object") {
                        if(data[0]) { 
				return "array";
			} else { 
				return "object"; 
			}
                } else {
			return typeof data;
		}
        }
    },
	 
    execute: function(callback) {
		this.loop = callback;
		return this;
    },

    for: function(data, time) {
        var itIs = this.whatIs(data),
		that = this;
        
        if(time) {
            var i = 0,
            interval = setInterval(function() {
                that.loop.call(that, i);
                i++;
                if(i == data) {
                    clearInterval(interval);
                    if(that.onComplete) that.onComplete.call();
                }
            }, time);
	    return that;
        } else {
            switch( itIs ) {
                case "number":
                    for(var i=0; i<data; i++) {
                        that.loop.call(that, i);
                        if(i == data-1) {
                            if(that.onComplete) that.onComplete.call();
                        }
                    }
            
                    return that;
                break;
            
                case "array":
                    for(var i=0; i<data.length; i++) {
                        that.loop.call(that, i, data[i]);
                        if(i == data.length-1) {
                            if(that.onComplete) that.onComplete.call();
                        }
                    }
            
                    return that;
                break;
            
                case "object":
                    var i;
                    for(key in data) {
                        i++;
                        that.loop.call(that, key, data[key]);
                    }
                    
                    return that;
                break;
            }
        }
    },
    
    done: function(callback) {
        this.onComplete = callback;
        return this;
    },
    
    positionOf: function(obj, list) {
        var position;
        for(var i = 0; i < list.length; i++){
            if(list[i] === obj) position = i;
        }
        return position;
    },
    
    /** Layers **/ 
    newLayer: function() {
            return (new Canvas);
    },
    
    changeLayer: function(i) {
        var layer;
        switch(i) {
            case "last":
            case "bottom":
            case "back":
                //First layer is the back
                //Unless someones been popping around with the layers variable *evil eyes*
                layer = 0;
            break;
        
            case "first":
            case "top":
            case "front":
                layer = layers.length-1;
            break;
        
            default:
                layer = i;
        }
        
        //Set the current layer to the selected layer
        thisLayer = layers[layer];
        
        return thisLayer;
    },
    
    selectLayer: function(i) {
        return changeLayer.call(document, i);
    },
    
    getLayer: function(i) {
        return layers[i];
    },
    
    createPalette: function(length) {
        execute(Canvas).for(length);
        return layers;
    },
    
    setBackground: function(style) {
        selectLayer(0).background(style);
    },
	
	timeline: function(functions, length) {
		var that = this;
		execute(function(i) {
			if(functions[i+1]) functions[i+1].call(this, (i+1)*length/100);
		}).for(100, Math.ceil(length/100));
	}
};


Canvas.context = {
	empty: function() {
		this.canvas.width = this.canvas.width;
	},
    
    clear: function() {
        this.empty();
    },
    
	height: function(num) {
        if(num) {
            execute(function(i, elem) {
                elem.canvas.height = num;
            }).for(layers);
            
            document.getElementById("easel").style.height = num + "px";
        } else {
            return this.canvas.height;
        }
	},
	
	width: function(num) {
		if(num) {   
            execute(function(i, elem) {
                elem.canvas.width = num;
            }).for(layers);
            
            document.getElementById("easel").style.width = num + "px";
		} else {
			return this.canvas.width;
		}
	},
	
	circle: function(x, y, radius, color) {
		this.fillStyle = (color) ? color : "#000";
		this.beginPath();
		this.arc(x, y, radius, 0, Math.PI*2, true);
		this.fill();
		this.closePath();
	},
    
    square: function(x, y, height, color) {
		this.fillStyle = (color) ? color : "#000";
		this.fillRect(x, y, x+height, y+height);
    },
    
    background: function(style) {
		console.log(this);
        this.fillStyle = style;
        this.fillRect(0,0, this.width(), this.height());
    },

    index: function() {
        return parseInt(this.canvas.style.zIndex);
    },
    
    prevLayer: function() {
        return layers[this.index()-2];
    },
    
    nextLayer: function() {
        return layers[this.index()+1];
    },
    
    bringToFront: function() {
        var currentPos = this.index();
        
        execute(function(i, elem) {
            if(elem.index() > currentPos) elem.canvas.style.zIndex = elem.index() - 1;
        }).for(layers);
        
        this.canvas.style.zIndex = layers.length-1;
    },
    
    sendToBack: function() {
        var currentPos = this.index();
        
        execute(function(i, elem) {
            if(elem.index() < currentPos) elem.canvas.style.zIndex = elem.index() + 1;
        }).for(layers);
        
        this.canvas.style.zIndex = 0;
        
        return thisLayer;
    },
    
    shiftBack: function() {
        var currentPos = this.index();
        
        selectLayer(currentPos-1).canvas.style.zIndex = currentPos;
        this.canvas.style.zIndex = currentPos-1;
        
        return thisLayer;
        
    },
    
    shiftForward: function() {
        selectLayer(this.index()+1).shiftBack();
    }
	
};

Canvas.element = {
    ctx: function(context) {
        return this.getContext(context ? context : "2d");
    }
};

Canvas.extend(Canvas.element, HTMLCanvasElement.prototype);
Canvas.extend(Canvas.context, CanvasRenderingContext2D.prototype);
Canvas.extend(Canvas.window, window);
