// 将播放相关的代码封装到一个对象中，与jQuery实现原理相同
// 闭包，内部数据不对外部数据造成污染
// window对象，将闭包中需要传递给外界的变量变为全局变量
(function(window){
    function Player($audio){
        return new Player.prototype.init($audio);
    }
    Player.prototype={
        constructor:Player,
        musicList:[],
        init:function($audio){// 强制初始化
            this.$audio=$audio;
            this.audio=$audio.get(0);
        },
        currentIndex:-1,
        playMusic:function(index,music){
            // 判断是否是同一首音乐
            if(this.currentIndex==index){
                // 同一首音乐
                if(this.audio.paused){
                    this.audio.play();
                }else{
                    this.audio.pause();
                }
            }else{
                // 不是同一首，则切换audio地址
                this.$audio.attr("src",music.link_url);
                this.audio.play();
                this.currentIndex=index;
            }
        },
        preIndex:function(){
            var index=this.currentIndex-1;
            if(index<0){
                index=this.musicList.length-1;// 第0首的上一首是最后一首
            }
            return index;
        },
        nextIndex:function(){
            var index=this.currentIndex+1;
            if(index==this.musicList.length){
                index=0;// 最后一首的下一首是第0首
            }
            return index;
        },
        changeMusic:function(index){
            // 删除对应的数据
            this.musicList.splice(index,1);
            // 当前删除的是否在正在播放的音乐之前
            if(index<this.currentIndex){
                this.currentIndex=this.currentIndex-1;
            }
        },
        musicTimeUpdate:function(callback){
            var $this=this;
            this.$audio.on("timeupdate",function(){
                var duration=$this.audio.duration;
                var currentTime=$this.audio.currentTime;
                var timeStr=$this.formatDate(duration,currentTime);
                callback(duration,currentTime,timeStr);
            });
        },
        formatDate:function(duration,currentTime){
            var endMin=parseInt(duration/60);
            var endSec=parseInt(duration%60);
            if(endMin<10){endMin='0'+endMin;}
            if(endSec<10){endSec='0'+endSec;}
            
            var startMin=parseInt(currentTime/60);
            var startSec=parseInt(currentTime%60);
            if(startMin<10){startMin='0'+startMin;}
            if(startSec<10){startSec='0'+startSec;}

            return startMin+":"+startSec+" / "+endMin+":"+endSec;
        },
        musicSeekTo:function(value){
            if(isNaN(value)) return;
            this.audio.currentTime=this.audio.duration*value;
        },
        musicVoiceSeekTo:function(value){
            if(isNaN(value)) return;
            if(value<0||value>1) return;
            this.audio.volume=value;
        }
    };
    // 使用init()创建的对象也能使用Player的方法
    Player.prototype.init.prototype=Player.prototype;
    window.Player=Player;
})(window);