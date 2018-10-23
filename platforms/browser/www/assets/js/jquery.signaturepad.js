(function($){function SignaturePad(selector,options){var self=this,settings=$.extend({},$.fn.signaturePad.defaults,options),context=$(selector),canvas=$(settings.canvas,context),element=canvas.get(0),canvasContext=null,previous={'x':null,'y':null},output=[],mouseLeaveTimeout=!1,mouseButtonDown=!1,touchable=!1,eventsBound=!1,typeItDefaultFontSize=30,typeItCurrentFontSize=typeItDefaultFontSize,typeItNumChars=0,strokePoints=[]
function clearMouseLeaveTimeout(){clearTimeout(mouseLeaveTimeout)
mouseLeaveTimeout=!1
mouseButtonDown=!1}
function drawLine(e,newYOffset){var offset,newX,newY
e.preventDefault()
offset=$(e.target).offset()
clearTimeout(mouseLeaveTimeout)
mouseLeaveTimeout=!1
if(typeof e.changedTouches!=='undefined'){newX=Math.floor(e.changedTouches[0].pageX-offset.left)
newY=Math.floor(e.changedTouches[0].pageY-offset.top)}else{newX=Math.floor(e.pageX-offset.left)
newY=Math.floor(e.pageY-offset.top)}
if(previous.x===newX&&previous.y===newY)
return!0
if(previous.x===null)
previous.x=newX
if(previous.y===null)
previous.y=newY
if(newYOffset)
newY+=newYOffset
canvasContext.beginPath()
canvasContext.moveTo(previous.x,previous.y)
canvasContext.lineTo(newX,newY)
canvasContext.lineCap=settings.penCap
canvasContext.stroke()
canvasContext.closePath()
if(settings.drawBezierCurves===!0){strokePoints.push({'lx':newX,'ly':newY,'mx':previous.x,'my':previous.y});var maxCacheLength=4*settings.bezierSkip;if(strokePoints.length>=maxCacheLength){var retrace=output.slice(output.length-maxCacheLength+2,output.length);canvasContext.strokeStyle=settings.bgColour;for(i in retrace){var point=retrace[i];canvasContext.beginPath()
canvasContext.moveTo(point.mx,point.my)
canvasContext.lineTo(point.lx,point.ly)
canvasContext.lineCap=settings.penCap
canvasContext.stroke()
canvasContext.closePath()}
canvasContext.strokeStyle=settings.penColour
strokePath(strokePoints,canvasContext);strokePoints=strokePoints.slice(maxCacheLength-1,maxCacheLength)}}
output.push({'lx':newX,'ly':newY,'mx':previous.x,'my':previous.y})
previous.x=newX
previous.y=newY
if(settings.onDraw&&typeof settings.onDraw==='function')
settings.onDraw.apply(self)}
function stopDrawing(e){if(!!e&&!(e.type==="touchend"||e.type=="touchcancel")){drawLine(e,1)}else{if(touchable){canvas.each(function(){this.removeEventListener('touchmove',drawLine)})}else{canvas.unbind('mousemove.signaturepad')}
if(output.length>0){if(settings.onDrawEnd&&typeof settings.onDrawEnd==='function')
settings.onDrawEnd.apply(self)
strokePoints=[];resetCanvas();drawSignature(output,canvasContext,!1)}}
previous.x=null
previous.y=null
if(settings.output&&output.length>0)
$(settings.output,context).val(JSON.stringify(output))}
function drawSigLine(){if(!settings.lineWidth)
return!1
canvasContext.beginPath()
canvasContext.lineWidth=settings.lineWidth
canvasContext.strokeStyle=settings.lineColour
canvasContext.moveTo(settings.lineMargin,settings.lineTop)
canvasContext.lineTo(element.width-settings.lineMargin,settings.lineTop)
canvasContext.stroke()
canvasContext.closePath()}
function resetCanvas(){canvasContext.clearRect(0,0,element.width,element.height)
canvasContext.fillStyle=settings.bgColour
canvasContext.fillRect(0,0,element.width,element.height)
if(!settings.displayOnly)
drawSigLine()
canvasContext.lineWidth=settings.penWidth
canvasContext.strokeStyle=settings.penColour}
function clearCanvas(){resetCanvas();$(settings.output,context).val('')
output=[]
stopDrawing()}
function onMouseMove(e,o){if(previous.x==null){drawLine(e,1)}else{drawLine(e,o)}}
function startDrawing(e,touchObject){if(touchable){touchObject.addEventListener('touchmove',onMouseMove,!1)}else{canvas.bind('mousemove.signaturepad',onMouseMove)}
drawLine(e,1)}
function disableCanvas(){eventsBound=!1
canvas.each(function(){if(this.removeEventListener){this.removeEventListener('touchend',stopDrawing)
this.removeEventListener('touchcancel',stopDrawing)
this.removeEventListener('touchmove',drawLine)}
if(this.ontouchstart)
this.ontouchstart=null})
$(document).unbind('mouseup.signaturepad')
canvas.unbind('mousedown.signaturepad')
canvas.unbind('mousemove.signaturepad')
canvas.unbind('mouseleave.signaturepad')
$(settings.clear,context).unbind('click.signaturepad')}
function initDrawEvents(e){if(eventsBound)
return!1
eventsBound=!0
$('input').blur();if(typeof e.changedTouches!=='undefined')
touchable=!0
if(touchable){canvas.each(function(){this.addEventListener('touchend',stopDrawing,!1)
this.addEventListener('touchcancel',stopDrawing,!1)})
canvas.unbind('mousedown.signaturepad')}else{$(document).bind('mouseup.signaturepad',function(){if(mouseButtonDown){stopDrawing()
clearMouseLeaveTimeout()}})
canvas.bind('mouseleave.signaturepad',function(e){if(mouseButtonDown)stopDrawing(e)
if(mouseButtonDown&&!mouseLeaveTimeout){mouseLeaveTimeout=setTimeout(function(){stopDrawing()
clearMouseLeaveTimeout()},500)}})
canvas.each(function(){this.ontouchstart=null})}}
function drawIt(){$(settings.typed,context).hide()
clearCanvas()
canvas.each(function(){this.ontouchstart=function(e){e.preventDefault()
mouseButtonDown=!0
initDrawEvents(e)
startDrawing(e,this)}})
canvas.bind('mousedown.signaturepad',function(e){e.preventDefault()
mouseButtonDown=!0
initDrawEvents(e)
startDrawing(e)})
$(settings.clear,context).bind('click.signaturepad',function(e){e.preventDefault();clearCanvas()})
$(settings.typeIt,context).bind('click.signaturepad',function(e){e.preventDefault();typeIt()})
$(settings.drawIt,context).unbind('click.signaturepad')
$(settings.drawIt,context).bind('click.signaturepad',function(e){e.preventDefault()})
$(settings.typeIt,context).removeClass(settings.currentClass)
$(settings.drawIt,context).addClass(settings.currentClass)
$(settings.sig,context).addClass(settings.currentClass)
$(settings.typeItDesc,context).hide()
$(settings.drawItDesc,context).show()
$(settings.clear,context).show()}
function typeIt(){clearCanvas()
disableCanvas()
$(settings.typed,context).show()
$(settings.drawIt,context).bind('click.signaturepad',function(e){e.preventDefault();drawIt()})
$(settings.typeIt,context).unbind('click.signaturepad')
$(settings.typeIt,context).bind('click.signaturepad',function(e){e.preventDefault()})
$(settings.output,context).val('')
$(settings.drawIt,context).removeClass(settings.currentClass)
$(settings.typeIt,context).addClass(settings.currentClass)
$(settings.sig,context).removeClass(settings.currentClass)
$(settings.drawItDesc,context).hide()
$(settings.clear,context).hide()
$(settings.typeItDesc,context).show()
typeItCurrentFontSize=typeItDefaultFontSize=$(settings.typed,context).css('font-size').replace(/px/,'')}
function type(val){var typed=$(settings.typed,context),cleanedVal=val.replace(/>/g,'&gt;').replace(/</g,'&lt;').trim(),oldLength=typeItNumChars,edgeOffset=typeItCurrentFontSize*0.5
typeItNumChars=cleanedVal.length
typed.html(cleanedVal)
if(!cleanedVal){typed.css('font-size',typeItDefaultFontSize+'px')
return}
if(typeItNumChars>oldLength&&typed.outerWidth()>element.width){while(typed.outerWidth()>element.width){typeItCurrentFontSize--
typed.css('font-size',typeItCurrentFontSize+'px')}}
if(typeItNumChars<oldLength&&typed.outerWidth()+edgeOffset<element.width&&typeItCurrentFontSize<typeItDefaultFontSize){while(typed.outerWidth()+edgeOffset<element.width&&typeItCurrentFontSize<typeItDefaultFontSize){typeItCurrentFontSize++
typed.css('font-size',typeItCurrentFontSize+'px')}}}
function onBeforeValidate(context,settings){$('p.'+settings.errorClass,context).remove()
context.removeClass(settings.errorClass)
$('input, label',context).removeClass(settings.errorClass)}
function onFormError(errors,context,settings){if(errors.nameInvalid){context.prepend(['<p class="',settings.errorClass,'">',settings.errorMessage,'</p>'].join(''))
$(settings.name,context).focus()
$(settings.name,context).addClass(settings.errorClass)
$('label[for='+$(settings.name).attr('id')+']',context).addClass(settings.errorClass)}
if(errors.drawInvalid)
context.prepend(['<p class="',settings.errorClass,'">',settings.errorMessageDraw,'</p>'].join(''))}
function validateForm(){var valid=!0,errors={drawInvalid:!1,nameInvalid:!1},onBeforeArguments=[context,settings],onErrorArguments=[errors,context,settings]
if(settings.onBeforeValidate&&typeof settings.onBeforeValidate==='function'){settings.onBeforeValidate.apply(self,onBeforeArguments)}else{onBeforeValidate.apply(self,onBeforeArguments)}
if(settings.drawOnly&&output.length<1){errors.drawInvalid=!0
valid=!1}
if($(settings.name,context).val()===''){errors.nameInvalid=!0
valid=!1}
if(settings.onFormError&&typeof settings.onFormError==='function'){settings.onFormError.apply(self,onErrorArguments)}else{onFormError.apply(self,onErrorArguments)}
return valid}
function strokePath(paths,context){var showSampledPoints=!1;var bezierSkip=4;var section=[];var sections=[];for(var i=0;i<paths.length-1;i++){if(typeof(paths[i])==='object'&&typeof(paths[i+1])==='object'){var source=paths[i];var destination=paths[i+1];if(source.mx==source.lx&&source.my==source.ly){continue}else{section.push(source)}
if(!(source.lx==destination.mx&&source.ly==destination.my)&&!(source.mx==destination.lx&&source.my==destination.ly)){sections.push(section);section=[]}
if(i==paths.length-2){section.push(destination);sections.push(section)}}}
var lengths=[];for(k=0;k<sections.length;k++){var lastPoint=sections[k].pop();sections[k]=sections[k].filter(function(element,index){return index%settings.bezierSkip==0});sections[k].push(lastPoint);var section=sections[k];for(j=0;j<section.length;j++){var point=section[j];var length=Math.abs(point.lx-point.mx)+Math.abs(point.ly-point.my);lengths.push(length)}}
var signatureStats=stats(lengths);signatureStats.length=numeric.sum(lengths);signatureStats.mean*=3;signatureStats.deviation*=3
for(k=0;k<sections.length;k++){var section=sections[k];var simpleTuples=section.map(function(n){return[n.lx,n.ly]});var beziers=getBezierControlPoints(simpleTuples);for(var i in beziers){var p0=beziers[i][0],p1=beziers[i][1],p2=beziers[i][2],p3=beziers[i][3];if(settings.variableStrokeWidth===!0){var bezierSegmentLength=(Math.abs(p0[0]-p1[0])+Math.abs(p1[0]-p2[0])+Math.abs(p2[0]-p3[0])+Math.abs(p0[1]-p1[1])+Math.abs(p1[1]-p2[1])+Math.abs(p2[1]-p3[1]));var zscore=(bezierSegmentLength-signatureStats.mean)/signatureStats.deviation;if(zscore>0){var width=3-zscore/2.5}else if(zscore<=0){var width=3-zscore*2}}
if(showSampledPoints===!0){var pixelSize=2;context.fillStyle='#FF0000';context.fillRect(p0[0],p0[1],pixelSize,pixelSize);context.fillRect(p3[0],p3[1],pixelSize,pixelSize)}
context.beginPath()
context.moveTo(p0[0],p0[1])
context.bezierCurveTo(p1[0],p1[1],p2[0],p2[1],p3[0],p3[1]);context.lineWidth=settings.penWidth
context.lineWidth=width;context.lineCap=settings.penCap
context.stroke()
context.closePath()}}}
function drawSignature(paths,context,saveOutput){if(settings.autoscale){var maxX=0,maxY=0,minX=$(canvas).width(),minY=$(canvas).height();$.each(paths,function(idx,el){maxX=Math.max(el.mx,el.lx,maxX);minX=Math.min(el.mx,el.lx,minX);maxY=Math.max(el.my,el.ly,maxY);minY=Math.min(el.my,el.ly,minY)});var padding=0.15;maxX*=(1+padding);minX*=(1-padding);maxY*=(1+padding);minY*=(1-padding);var signatureWidth=maxX-minX;var signatureHeight=maxY-minY;var signatureAspectRatio=signatureWidth/signatureHeight;var canvasAspectRatio=canvas.width()/canvas.height();if(signatureAspectRatio>canvasAspectRatio){var scaleFactor=canvas.width()/signatureWidth}else{var scaleFactor=canvas.height()/signatureHeight}
context.translate(-minX*scaleFactor,-minY*scaleFactor);context.scale.apply(context,[scaleFactor,scaleFactor]);context.translate((canvas.width()/scaleFactor-signatureWidth)/2,(canvas.height()/scaleFactor-signatureHeight)/2)}else{context.scale.apply(context,settings.scale)}
for(var i in paths){if(typeof paths[i]==='object'){if(settings.drawBezierCurves===!1){context.beginPath()
context.moveTo(paths[i].mx,paths[i].my)
context.lineTo(paths[i].lx,paths[i].ly)
context.lineCap=settings.penCap
context.stroke()
context.closePath()}
if(saveOutput){output.push({'lx':paths[i].lx,'ly':paths[i].ly,'mx':paths[i].mx,'my':paths[i].my})}}}
if(settings.drawBezierCurves===!0){strokePath(paths,context)}}
function init(){if(parseFloat(((/CPU.+OS ([0-9_]{3}).*AppleWebkit.*Mobile/i.exec(navigator.userAgent))||[0,'4_2'])[1].replace('_','.'))<4.1){$.fn.Oldoffset=$.fn.offset;$.fn.offset=function(){var result=$(this).Oldoffset()
result.top-=window.scrollY
result.left-=window.scrollX
return result}}
$(settings.typed,context).bind('selectstart.signaturepad',function(e){return $(e.target).is(':input')})
canvas.bind('selectstart.signaturepad',function(e){return $(e.target).is(':input')})
if(!element.getContext&&FlashCanvas)
FlashCanvas.initElement(element)
if(element.getContext){canvasContext=element.getContext('2d')
$(settings.sig,context).show()
if(!settings.displayOnly){if(!settings.drawOnly){$(settings.name,context).bind('keyup.signaturepad',function(){type($(this).val())})
$(settings.name,context).bind('blur.signaturepad',function(){type($(this).val())})
$(settings.drawIt,context).bind('click.signaturepad',function(e){e.preventDefault()
drawIt()})}
if(settings.drawOnly||settings.defaultAction==='drawIt'){drawIt()}else{typeIt()}
if(settings.validateFields){if($(selector).is('form')){$(selector).bind('submit.signaturepad',function(){return validateForm()})}else{$(selector).parents('form').bind('submit.signaturepad',function(){return validateForm()})}}
$(settings.sigNav,context).show()}}}
$.extend(self,{init:function(){init()},updateOptions:function(options){$.extend(settings,options)},regenerate:function(paths){self.clearCanvas()
$(settings.typed,context).hide()
if(typeof paths==='string')
paths=JSON.parse(paths)
drawSignature(paths,canvasContext,!0)
if(settings.output&&$(settings.output,context).length>0)
$(settings.output,context).val(JSON.stringify(output))},clearCanvas:function(){clearCanvas()},getSignature:function(){return output},getSignatureString:function(){return JSON.stringify(output)},getSignatureImage:function(){var tmpCanvas=document.createElement('canvas'),tmpContext=null,data=null
tmpCanvas.style.position='absolute'
tmpCanvas.style.top='-999em'
tmpCanvas.width=element.width
tmpCanvas.height=element.height
document.body.appendChild(tmpCanvas)
if(!tmpCanvas.getContext&&FlashCanvas)
FlashCanvas.initElement(tmpCanvas)
tmpContext=tmpCanvas.getContext('2d')
tmpContext.fillStyle=settings.bgColour
tmpContext.fillRect(0,0,element.width,element.height)
tmpContext.lineWidth=settings.penWidth
tmpContext.strokeStyle=settings.penColour
drawSignature(output,tmpContext)
data=tmpCanvas.toDataURL.apply(tmpCanvas,arguments)
document.body.removeChild(tmpCanvas)
tmpCanvas=null
return data},validateForm:function(){return validateForm()}})}
$.fn.signaturePad=function(options){var api=null
this.each(function(){if(!$.data(this,'plugin-signaturePad')){api=new SignaturePad(this,options)
api.init()
$.data(this,'plugin-signaturePad',api)}else{api=$.data(this,'plugin-signaturePad')
api.updateOptions(options)}})
return api}
$.fn.signaturePad.defaults={defaultAction:'typeIt',displayOnly:!1,drawOnly:!1,canvas:'canvas',sig:'.sig',sigNav:'.sigNav',bgColour:'#ffffff',penColour:'#145394',penWidth:2,penCap:'round',lineColour:'#ccc',lineWidth:2,lineMargin:5,lineTop:35,name:'.name',typed:'.typed',clear:'.clearButton',typeIt:'.typeIt a',drawIt:'.drawIt a',typeItDesc:'.typeItDesc',drawItDesc:'.drawItDesc',output:'.output',currentClass:'current',validateFields:!0,errorClass:'error',errorMessage:'Please enter your name',errorMessageDraw:'Please sign the document',onBeforeValidate:null,onFormError:null,onDraw:null,onDrawEnd:null,scale:[1,1],autoscale:!1,drawBezierCurves:!1,variableStrokeWidth:!1,bezierSkip:4,}}(jQuery))