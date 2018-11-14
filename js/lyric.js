(function(window){
    function Lyric(path){
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype={
        constructor:Lyric,
        init:function(path){
            this.path=path;
        },
        times:[],
        lyrics:[],
        index:-1,
        loadLyric:function(callback){
            var $this=this;
            $.ajax({
                url:$this.path,
                type:"GET",
                dataType:"text",
                success:function(data){
                    $this.parseLyric(data);
                    callback();
                },
                error:function(e){
                    console.log(e);
                }
            });
        },
        parseLyric:function(data){
            var $this=this;
            // 清空上一首歌曲的时间和歌词
            this.times=[];
            this.lyrics=[];
            var array=data.split("\n");
            // [00:00.92]
            var timeReg=/\[(\d*:\d*\.\d*)\]/;
            // 遍历取出每一条歌词
            $.each(array,function(index,ele){
                // 处理歌词
                var lrc=ele.split("]")[1];
                // 排除没有歌词的空字符串
                if(lrc.length==1) return;
                $this.lyrics.push(lrc);
                
                var res=timeReg.exec(ele);
                //console.log(res);
                if(res==null) return;
                var timeStr=res[1];// 00:00.92
                var res2=timeStr.split(":");
                var min=parseInt(res2[0])*60;
                var sec=parseFloat(res2[1]);
                var time=parseFloat((min+sec).toFixed(2));
                $this.times.push(time);               
            });
            // console.log($this.times);
            // console.log($this.lyrics);
        },
        currentIndex:function(currentTime){           
            if(currentTime>this.times[0]){
                this.index++;
                this.times.shift();
            }
            return this.index;
        }
    };
    
    Lyric.prototype.init.prototype=Lyric.prototype;
    window.Lyric=Lyric;
})(window);