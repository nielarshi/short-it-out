define(function(require, exports, module) {


    var BufferLoader = require('./BufferLoader'); 

    /**
     * @author Reza Ali http://www.syedrezaali.com/
     */
    function SoundPlayer(urls, callback) { 
        this.context; 
        this.node; 
        this.buffersActive = []; 

        try {    
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            this.bufferLoader = new BufferLoader(this.context, urls, this.setSounds.bind(this));
            this.sounds;
            this.callback = callback || undefined; 
            this.bufferLoader.load();    
            this.volume = 1;   
            this.setVolume(); 
        }
        catch(e) {
            console.log('Web Audio API is not supported in this browser');
        }
    }

    SoundPlayer.prototype.setSounds = function(sounds) { 
        this.sounds = sounds;
        if(this.callback != undefined){
            this.callback(); 
        }
    }; 

    SoundPlayer.prototype.isPlaying = function()
    {
        if(this.buffersActive.length > 0){
            return true; 
        }
        else
        {
            return false; 
        }        
    };

    SoundPlayer.prototype.setVolume = function(volume)
    {
        var volumeTemp = (typeof volume === 'undefined') ? 1 : volume;
        this.volume = volumeTemp;

        if(this.volume===0) {
            this.stopPlaying();
        } 
    };

    SoundPlayer.prototype.getVolume = function()
    {
        return this.volume;
    };

    SoundPlayer.prototype.stopPlaying = function()
    {
        var len = this.buffersActive.length; 
        if(len > 0){
            for(var i = 0; i < len; i++)
            {
                var buffer = this.buffersActive[i]; 
                buffer.stop(0.0);             
            }
        }        
    }; 

    SoundPlayer.prototype.getContext = function()
    {
        return this.context; 
    }; 

    SoundPlayer.prototype.addNode = function(node)
    {
        this.node = node; 
    }; 

    SoundPlayer.prototype.playSound = function(i, volume, loop, callback) {

        try{
            if(this.context && this.sounds)
            {
                var buffer = this.context.createBufferSource();
                buffer.loop = (typeof loop === 'undefined') ? false : loop;
                var gain = this.context.createGainNode ? this.context.createGainNode() : this.context.createGain(); 
                gain.gain.value = (typeof volume === 'undefined') ? this.volume : volume;
                buffer.buffer = this.sounds[i];
                buffer.connect(gain);
                var lastNode = gain; 
                if(this.node) {                
                    lastNode.connect(this.node); 
                    lastNode = this.node; 
                }
                lastNode.connect(this.context.destination);           
                buffer.start();  
                buffer.onended = (function() {
                    var index = this.buffersActive.indexOf(buffer); 
                    if(index !== -1){
                        this.buffersActive.splice(index, 1);                     
                    }
                    if(callback){
                        callback();
                    }          
                }).bind(this, buffer); 
                this.buffersActive.push(buffer);             
            }
        }//end try
        catch(e){
            //so sad... no sound
            console.log('so sad no sound ',e, e.getStack());
        }
        
    }; 

    module.exports = SoundPlayer;
}); 