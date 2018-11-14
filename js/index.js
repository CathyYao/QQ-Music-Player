 $(function(){
    // 0.自定义滚动条
    $(".content_list").mCustomScrollbar();

    var $audio=$("audio");
    var player=new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;
    // 1.加载歌曲列表
    getPlayerList();
    function getPlayerList(){
        $.ajax({
            url:"./source/musiclist.json",
            type:"GET",
            dataType:"json",
            success:function(data){
                player.musicList=data;
                // 遍历获取到的数据创建每一条音乐
                $musicList=$(".content_list ul");// 避免每次循环都查找一次
                $.each(data,function(index,value){
                    var $item=createMusicItem(index,value);
                    $musicList.append($item);
                });
                // 初始化第0首歌曲信息
                initMusicInfo(data[0]);
                initLyricInfo(data[0]);
            },
            error:function(e){
                console.log(e);
            }
        });
    }

    // 2.初始化歌曲信息
    function initMusicInfo(music){
        // 获取对应的元素
        var $musicImage=$(".song_info_pic img");
        var $musicName=$(".song_info_name a");
        var $musicSinger=$(".song_info_singer a");
        var $musicAlbum=$(".song_info_album a");
        var $musicProgressName=$(".music_progress_name");
        var $musicProgressTime=$(".music_progress_time");
        var $musicBg=$(".mask_bg");
        // 给获取到的元素赋值
        $musicImage.attr("src",music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name+" / "+music.singer);
        $musicProgressTime.text("00:00 / "+music.time);
        $musicBg.css("background","url('"+music.cover+"')");
    }

    // 初始化歌词信息
    function initLyricInfo(music){
        lyric=new Lyric(music.link_lrc);
        var $lyricContainer=$(".song_lyric");
        // 清空上一首音乐的歌词
        $lyricContainer.html("");
        lyric.loadLyric(function(){
            // 创建歌词列表
            $.each(lyric.lyrics,function(index,ele){
                var $item=$("<li>"+ele+"</li>");
                $lyricContainer.append($item);
            });
        });
    }

    // 3.初始化进度条
    initProgress();
    function initProgress(){
        var $progressBar=$(".music_progress_bar");
        var $progressLine=$(".music_progress_line");
        var $progressDot=$(".music_progress_dot");
        progress=new Progress($progressBar,$progressLine,$progressDot);
        progress.progressClick(function(value){
            player.musicSeekTo(value);
        });
        progress.progressMove(function(value){
            player.musicSeekTo(value);
        });
    
        var $voiceBar=$(".music_voice_bar");
        var $voiceLine=$(".music_voice_line");
        var $voiceDot=$(".music_voice_dot");
        voiceProgress=new Progress($voiceBar,$voiceLine,$voiceDot);
        voiceProgress.progressClick(function(value){
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function(value){
            player.musicVoiceSeekTo(value);
        });
    }

    // 2.初始化事件监听
    initEvents();
    function initEvents(){
        // 1.监听歌曲的移入移出事件
        $(".content_list").delegate(".list_music","mouseenter",function(){
            // 显示子菜单
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".list_time a").stop().fadeIn(100);
            // 隐藏时长
            $(this).find(".list_time span").stop().fadeOut(100);
        })
        $(".content_list").delegate(".list_music","mouseleave",function(){
            // 隐藏子菜单
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".list_time a").stop().fadeOut(100);
            // 显示时长
            $(this).find(".list_time span").stop().fadeIn(100);
        });

        // 2.监听复选框的点击事件，通过添加类添加带对号的背景图片
        $(".content_list").delegate(".list_check","click",function(){
            $(this).toggleClass("list_checked");
        });

        // 3.监听子菜单播放按钮的点击
        var $musicPlay=$(".music_play");
        $(".content_list").delegate(".list_menu_play","click",function(){
            var $item=$(this).parents(".list_music");
            //console.log($item.get(0).index);
            //console.log($item.get(0).music);
            // 3.1切换播放图标,复原其它播放图标
            $(this).toggleClass("list_menu_play2");
            $item.siblings().find(".list_menu_play").removeClass("list_menu_play2");
            // 3.2同步底部播放按钮，同步文字高亮
            if($(this).attr("class").indexOf("list_menu_play2")!=-1){
                // 当前子菜单按钮是播放状态
                $musicPlay.addClass("music_play2");
                $item.find("div").css("color","#fff");
                $item.siblings().find("div").css("color","rgba(255,255,255,0.5)");
            }else{
                $musicPlay.removeClass("music_play2");
                $item.find("div").css("color","rgba(255,255,255,0.5)");
            }
            // 3.3切换序号的状态
            $item.find(".list_number").toggleClass("list_number2");
            $item.siblings().find(".list_number").removeClass("list_number2");
            // 3.4播放音乐
            player.playMusic($item.get(0).index,$item.get(0).music);
            // 3.5切换歌曲信息
            initMusicInfo($item.get(0).music);
            // 3.6切换歌词信息
            initLyricInfo($item.get(0).music);
        });

        // 4.监听底部控制区域播放按钮的点击
        $musicPlay.click(function(){
            // 判断有没有播放过音乐
            if(player.currentIndex==-1){
                // 没有播放过音乐
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            }else{
                // 播放过音乐
                $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        });

        // 5.监听底部控制区域上一首按钮的点击
        $(".music_pre").click(function(){
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        });

        // 6.监听底部控制区域下一首按钮的点击
        $(".music_next").click(function(){
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        });

        // 7.监听删除按钮的点击
        $(".content_list").delegate(".list_menu_del","click",function(){
            var $item=$(this).parents(".list_music");
            // 当前删除的是否是正在播放的
            if($item.get(0).index==player.currentIndex){
                $(".music_next").trigger("click");
            }
            // 删除该条音乐
            $item.remove();
            // 从后台数据删除该条音乐
            player.changeMusic($item.get(0).index);
            // 重新排序
            $(".list_music").each(function(index,value){
                value.index=index;
                $(value).find(".list_number").text(index+1);
            });
        });

        // 8.监听播放进度
        player.musicTimeUpdate(function(duration,currentTime,timeStr){
            // 同步时间
            $(".music_progress_time").text(timeStr);
            // 同步进度条
            // 计算播放比例
            var value=currentTime/duration*100;
            progress.setProgress(value);
            // 实现歌词的同步
            var index=lyric.currentIndex(currentTime);
            var $items=$(".song_lyric li").eq(index);
            $items.addClass("cur");
            $items.siblings().removeClass("cur");
            if(index<=2) return;
            $(".song_lyric").css("marginTop",-30*(index-2)+"px");
        });

        // 9.监听声音按钮的点击
        $(".music_voice_icon").click(function(){
            // 图标切换
            $(this).toggleClass("music_voice_icon2");
            // 声音切换
            if($(this).attr("class").indexOf("music_voice_icon2")!=-1){
                // 静音
                player.musicVoiceSeekTo(0);
            }else{
                // 非静音
                player.musicVoiceSeekTo(1);
            }
        });
    }

    // 定义方法创建一条音乐
    function createMusicItem(index,music){
        var $item = $("<li class=\"list_music\">\n"+
        "    <div class=\"list_check\"><i></i></div>\n"+
        "    <div class=\"list_number\">"+(index+1)+"</div>\n"+
        "    <div class=\"list_name\">"+music.name+"\n"+
        "        <div class=\"list_menu\">\n"+
        "            <a href=\"javascript:\" title=\"播放\" class='list_menu_play'></a>\n"+
        "            <a href=\"javascript:\" title=\"添加\"></a>\n"+
        "            <a href=\"javascript:\" title=\"下载\"></a>\n"+
        "            <a href=\"javascript:\" title=\"分享\"></a>\n"+
        "        </div>\n"+
        "    </div>"+
        "    <div class=\"list_singer\">"+music.singer+"</div>\n"+
        "    <div class=\"list_time\">\n"+
        "        <span>"+music.time+"</span>\n"+
        "        <a href=\"javascript:\" title=\"删除\" class='list_menu_del'></a>\n"+
        "    </div>\n"+
        "</li>");
        $item.get(0).index=index;
        $item.get(0).music=music;
        return $item;
    }
});