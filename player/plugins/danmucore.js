/*
Belong to iTisso
Coder:LuoJia
 */
function DanmuCore() {
	var width, height;
	var parentPlayer;
	var player=this.player = {};
	var controlfuns=(this.controlfuns = {});
	var moveTime= 5000;
	var intervals = {};
	var danmulist = [],
	danmuobjlist = [],
	danmuarray = [],
	danmutunnel = {
		right: [],
		left: [],
		bottom: [],
		top: []
	},
	moverInterval = 1000 / 60,
	tunnelheight = 0,
	timeline = [],
	timepoint = 0,
	danmucontainer,
	divdanmucontainer = [];
	var danmufirer, superdanmu;
	var zimulist = [],
	zimucontainer;
	player.assvar = {};
	var drawlist;
	var videoinfo = {
		width: null,
		height: null,
		CrownHeight: null
	};
	var COL,Glib, moverAnimation, danmulayerAnimationFrame;
	function setdom() {
		(player.danmuframe = c_ele("div")).id = "danmuframe"; 
		(player.danmulayer = c_ele("canvas")).id = "danmulayer";
		(player.video = c_ele("video")).id = "video";
		player.danmuframe.appendChild(player.danmulayer);
		parentPlayer.videoframein.appendChild(player.video);
		parentPlayer.videoframein.appendChild(player.danmuframe);
		parentPlayer.core.video=player.video;
		initCOL();
	}
	function initCOL() {
		parentPlayer.core.COL =COL= newCOL();
		COL.font.color = '#ffffff';
		COL.font.fontFamily = "黑体";
		COL.setCanvas(player.danmulayer);
		COL.autoClear = true;
		Glib = getGraphlib(COL);
		initTextDanmuContainer();
		COL.MatrixTransform.on();
	}
	function initTextDanmuContainer() {
		/*普通弹幕层*/
		player.danmucontainer=danmucontainer = COL.Graph.New();
		danmucontainer.name = 'danmucontainer';
		danmucontainer.needsort = false;
		COL.document.addChild(danmucontainer);
		COL.Graph.Eventable(danmucontainer);
		danmucontainer.zindex(200);
		/*字幕弹幕层*/
		zimucontainer = COL.Graph.New();
		zimucontainer.name = 'zimucontainer';
		COL.document.addChild(zimucontainer);
		zimucontainer.zindex(2);
	}

	function fitdanmulayer() {
		"use strict";
		COL.adjustcanvas();
		width = player.danmulayer.width = video.offsetWidth;
		tunnelheight = player.danmulayer.height =video.offsetHeight;
		for (var i in danmucontainer.childNode) {
			if (danmucontainer.childNode[i].type == 2) {
				danmucontainer.childNode[i].set({
					x: width / 2,
					y: tunnelheight - danmucontainer.childNode[i].tunnelobj[2]
				});
			} else if (danmucontainer.childNode[i].type == 3) {
				danmucontainer.childNode[i].set({
					x: width / 2,
					y: danmucontainer.childNode[i].tunnelobj[2]
				});
			}
			danmucontainer.childNode[i].setMatrix();
		}
		COL.draw();
	}

	function fireinterval() {
		"use strict";
		if (timeline[timepoint]) {
			danmufuns.fire(timepoint);
		}
		timepoint += 10;
		if (!player.assvar.isPlaying) {
			clearInterval(intervals.timer);
		}
	}

	function newTimePiece(t, interval) {
		"use strict";
		if (intervals.timer) {
			clearInterval(intervals.timer);
			intervals.timer = 0;
		}
		if (t >= timepoint) {
			for (; timepoint <= t; timepoint += 10) {
				if (timeline[timepoint]) 
					setTimeout(danmufuns.fire,0,timepoint); 
			}
		} else {
			return;
		}
		intervals.timer = setInterval(fireinterval, 10 / player.video.playbackRate);
	}

	var getVideoMillionSec=this.getVideoMillionSec=function(){
		return ((player.video.currentTime * 100 + 0.5) | 0) * 10;
	}

	var danmufuns=this.danmufuns = {
		createCommonDanmu: function(danmuobj) {
			var color = isHexColor(danmuobj.co) ? ('#' + danmuobj.co) : '#fff';
			var bordercolor = (danmuobj.co == '000000') ? '#fff': '#000';
			setTimeout(function() {
				var TextDanmu = COL.Graph.NewTextObj(danmuobj.c, danmuobj.s, {
					color: color,
					textborderColor: bordercolor,
					textborderWidth: getOption("StorkeWidth","number"),
					type: danmuobj.ty,
					time: danmuobj.t,
					fontWeight: 600,
					realtimeVary: getOption("RealtimeVary","bool"),
					shadowBlur: getOption("ShadowWidth","number"),
					shadowColor: (danmuobj.co == '000000') ? '#fff': '#000'
				});
				TextDanmu.tunnelobj = danmufuns.getTunnel(danmuobj.ty, TextDanmu.lineHeight);
				switch (danmuobj.ty) {
				case 0:
					{
						TextDanmu.set({
							x:
							width,
							y: TextDanmu.tunnelobj[2]
						});
						break;
					}
				case 1:
					{
						TextDanmu.set({
							x:
							-TextDanmu.width,
							y: TextDanmu.tunnelobj[2]
						});
						break;
					}
				case 2:
					{
						TextDanmu.setPositionPoint(TextDanmu.width / 2, TextDanmu.height);
						TextDanmu.set({
							x: width / 2,
							y: tunnelheight - TextDanmu.tunnelobj[2]
						});
						break;
					}
				case 3:
					{
						TextDanmu.setPositionPoint(TextDanmu.width / 2, 0);
						TextDanmu.set({
							x: width / 2,
							y: TextDanmu.tunnelobj[2]
						});
						break;
					}
				default:
					{
						return;
					}
				}
				if (danmuobj.sended) {
					TextDanmu.backgroundColor = 'rgba(255,255,255,0.2)';
				}
				TextDanmu.danmuobj = danmuobj;
				COL.Graph.Eventable(TextDanmu);
				TextDanmu.setMatrix();
				danmucontainer.addChild(TextDanmu);
				parentPlayer.EC.fireEvent("danmucreated",TextDanmu);
			},
			0);

		},

		danmurefreshAnimationfun: function() {
		"use strict";
			danmulayerAnimationFrame = requestAnimationFrame(danmufuns.danmurefreshAnimationfun);
			danmufuns.movedanmuAnimation();
			COL.draw();
		},
		danmulayerAnimation: {
			start: function() {
				if (!danmulayerAnimationFrame) {
					danmulayerAnimationFrame = requestAnimationFrame(danmufuns.danmurefreshAnimationfun);
				}
			},
			stop: function() {
				if (danmulayerAnimationFrame) {
					cancelAnimationFrame(danmulayerAnimationFrame);
					danmulayerAnimationFrame = 0;
				}
			}
		},

		movedanmuAnimation: function() {
			if (danmucontainer.drawlist.length != 0) {
				danmufuns.mover();
			}
		},

		show: function() {
			this.showtextdanmu();
		},
		hide: function() {
			this.hidetextdanmu();
		},
		getTunnel: function(type, size) {
			var tunnel;
			switch (type) {
			case 0:
				{
					tunnel = danmutunnel.right;
					break;
				}
			case 1:
				{
					tunnel = danmutunnel.left;
					break;
				}
			case 2:
				{
					tunnel = danmutunnel.bottom;
					break;
				}
			case 3:
				{
					tunnel = danmutunnel.top;
					break;
				}
				default:{
					return;
				}
			}
			var tun = 0,
			ind = 1,
			i = 1;
			if (!tunnel[tun]) tunnel[tun] = [];
			while (ind < (i + size)) {
				if (tunnel[tun][ind]) {
					i = ind + tunnel[tun][ind];
					ind = i;
					if (ind > (tunnelheight - size)) {
						tun++;
						i = ind = 1;
						if (!tunnel[tun]) tunnel[tun] = [];
					}
				} else if (ind == (i + size - 1)) {
					break;
				} else {
					ind++;
				};
			}
			tunnel[tun][i] = size;
			var tunnelobj = [type, tun, i, height];
			return tunnelobj;
			/*轨道类号,分页号，轨道号*/
		},

		setDanmuArray: function() {
			for (var i = 0; i < danmulist.length; i++) {
				if (!danmuarray[danmulist[i].t]) danmuarray[danmulist[i].t] = [];
				danmuarray[danmulist[i].t].push(danmulist[i]);
			}
		},
		addToDanmuArray: function(danmuobj) {
			if (!danmuarray[danmuobj.t]) danmuarray[danmuobj.t] = [];
			danmuarray[danmuobj.t].push(danmuobj);
		},
		clear: function() {
			danmucontainer.drawlist.forEach(function(e) {
				e.parentNode.removeChild(e);
			});
			drawlist = danmucontainer.drawlist = [];
			danmutunnel = {
				right: [],
				left: [],
				bottom: [],
				top: []
			};
			COL.draw();
		},
		start: function() {
			danmufuns.danmulayerAnimation.start();
			newTimePiece(getVideoMillionSec());
		},
		pause: function() {

		},
		initFirer: function() {
			danmufuns.setDanmuArray();
		},
		mover: function() {
			'use strict';
			if (player.assvar.isPlaying) {
				var nowtime = (player.video.currentTime * 1000 + 0.5) | 0;
				if (COL.lastmovedtime == nowtime) return;
				COL.lastmovedtime = nowtime;
				moveTime=getOption("DanmuSpeed","number")*1000;
				var temp;
				for (var i = 0; i < danmucontainer.drawlist.length; i++) {
					var node = danmucontainer.drawlist[i];
					if (! (node && node.imageobj && node.tunnelobj)) continue;
					switch (node.type) {
					case 0:
						{
							node.x = (width + node.width) * (1 - (nowtime - node.time) / moveTime / width * 520) - node.width;
							if (node.tunnelobj[1] != null && node.x < width - node.width - 150) {
								delete danmutunnel.right[node.tunnelobj[1]][node.tunnelobj[2]];
								node.tunnelobj[1] = null;
							} else if (node.x < -node.width) {
								node.parentNode.removeChild(node);
								delete node.tunnelobj;
								continue;
							}
							node.setMatrix();
							break;
						}
					case 1:
						{
							node.x = (width + node.width) * (nowtime - node.time) / moveTime / width * 520 - node.width;
							if (node.tunnelobj[1] != null && node.x > 150) {
								delete danmutunnel.left[node.tunnelobj[1]][node.tunnelobj[2]];
								node.tunnelobj[1] = null;
							} else if (node.x > width) {
								node.parentNode.removeChild(node);
								delete node.tunnelobj;
								continue;
							}
							node.setMatrix();
							break;
						}
					case 2:
						{
							if (nowtime - node.time > moveTime) {
								node.parentNode.removeChild(node);
								delete danmutunnel.bottom[node.tunnelobj[1]][node.tunnelobj[2]];
								delete node.tunnelobj;
								COL.cct.clearRect(0, 0, COL.canvas.width, COL.canvas.height);
								continue;
							}
							break;
						}
					case 3:
						{
							if (nowtime - node.time > moveTime) {
								node.parentNode.removeChild(node);
								delete danmutunnel.top[node.tunnelobj[1]][node.tunnelobj[2]];
								delete node.tunnelobj;
								COL.cct.clearRect(0, 0, COL.canvas.width, COL.canvas.height);
								continue;
							}
							break;
						}
					default:
						continue;
					}
				}
			}

		},
		initnewDanmuObj: function(danmuobj) {
			if (typeof danmuobj == 'object') {
				parentPlayer.EC.fireEvent("newDanmakuInited",danmuobj);
				timeline[danmuobj.t] = true;
				danmufuns.addToDanmuArray(danmuobj);
			}
		},
		fire: function(t) {
			if (danmuarray[t]) {
				for (var i = 0; i < danmuarray[t].length; i++) {
					var tmpd = danmuarray[t][i];
					if (danmucontainer.display&&tmpd.ty <= 3 && tmpd.ty >= 0) {
							danmufuns.createCommonDanmu(tmpd);
					} else if (tmpd.ty == 4) {} else if (tmpd.ty == 5) {
						tmpd.fun();
					}
				}
			}
		},
		addTimepoint: function(t) {
			timeline[t] = true;
		},
		setTimeline: function() {
			var tarr = [];
			for (var i = 0; i < danmulist.length; i++) {
				if (danmulist[i].t >= 0) {
					tarr[danmulist[i].t] = true;
				}
			}
			timeline = tarr;
		},
		zimurevoluter: function(zinuobj) {}
	}

	controlfuns.play = function() {
		/*player.playbutton.style.display = 'none';*/
	}
	controlfuns.playing = function() {
		/*controlfuns.play();*/
		/*controlfuns.refreshprogresscanvas();*/
		danmufuns.start();
	}
	controlfuns.pause = function() {
		danmufuns.pause();
		player.assvar.isPaused = true;
	}

	controlfuns.gototime = function() {}
	controlfuns.loading = function() {}
	controlfuns.ended = function() {
		danmutunnel = {
			right: [],
			left: [],
			bottom: [],
			top: []
		}
		/*danmufuns.clear();*/
	}

	controlfuns.zimueditMode = {
		on: function() {},
		off: function() {}
	}
	controlfuns.codeDanmueditMode = {
		on: function() {},
		off: function() {}
	}

	function initevents() {
		var video = player.video;
		COL.document.addEvent('click',
		function(e) {
			if (e.target == COL.document) {
				if (video.paused) {
					danmufuns.start();
					video.play();
				} else {
					video.pause();
				}
			}
		});
		danmucontainer.addEvent("mousedown",
		function(e) {
			if (COL.mouseright) {
				e.stopPropagation();
			}
			if (COL.mouseleft) {
				if (player.video.paused) {
					/*danmufuns.start();*/
					player.video.play();
				} else {
					player.video.pause();
				}
			}
		});

		aEL(window, 'resize',
		function() {
			fitdanmulayer();
		});

		aEL(player.danmulayer, 'contextmenu',
		function(e) {
			e.preventDefault();
		});

		aEL(player.video, 'click',
		function(e) {
			e.preventDefault();
			if (video.paused) {
				video.play();
			} else {
				video.pause();
			}
		});

		aEL(video, 'play',
		function() {
			/*EVENT("play");*/
			/*console.log("事件:播放");*/
			/*controlfuns.refreshprogresscanvas();*/
			/*controlfuns.play();*/
		});
		aEL(video, 'pause',
		function() {
			/*console.log("事件:暂停");*/
			/*newstat("暂停");*/
			/*EVENT("pause");*/
			player.assvar.isPlaying = false;
			controlfuns.pause();
		});
		aEL(video, 'ended',
		function() {
			/*EVENT("ended");*/
			/*console.log('事件:播放结束');*/
			controlfuns.ended();
		});
		aEL(video, 'loadedmetadata',
		function() {
			/*console.log('事件:加载视频元信息');*/
			/*EVENT("loadedmetadata");*/
			/*player.o.totaltime = video.duration;*/
			/*获取媒体总时间*/
			/*controlfuns.refreshtime();*/
			/*controlfuns.refreshDanmuMark();*/
			videoinfo.width = player.video.offsetWidth;
			videoinfo.height = player.video.offsetHeight;
			videoinfo.CrownHeight = videoinfo.width / videoinfo.height;
			player.video.style.height = player.video.style.width = "100%";
			fitdanmulayer();
			parentPlayer.EC.fireEvent("videoready");
			/*player.videopreload.parentNode.removeChild(player.videopreload);*/
		});
		aEL(video, 'volumechange',
		function() {
			/*console.log("事件:音量");*/
			/*EVENT("volumechange");*/
			/*controlfuns.volumechange();*/
		});
		/*aEL(video, "durationchange",
		function() {
			console.log("事件:媒体长度改变");

		});*/
		aEL(video, 'loadstart',
		function() {
			/*EVENT("loadstart");*/
			/*console.log('事件:开始加载媒体');*/
			/*controlfuns.refreshprogresscanvas();*/
		});
		/*aEL(video, "abort",
		function() {
			console.log("事件:媒体加载中断");
		});*/
		aEL(video, 'playing',
		function() {
			/*EVENT("playing");*/
			player.assvar.isPlaying = true;
			controlfuns.playing();
		});
		aEL(video, 'progress',
		function() {
			/*console.log("事件:媒体加载中");*/
			/*EVENT("progress");*/
			/*controlfuns.refreshprogresscanvas();*/
		});
		aEL(video, 'seeked',
		function() {
			/*console.log("事件:已跳到新位置");*/
			timepoint = getVideoMillionSec();
			/*EVENT("seeked");*/
			/*controlfuns.refreshprogresscanvas();*/
			danmufuns.clear();
		});
		aEL(video, 'seeking',
		function() {
			/*console.log("事件:正在跳到新位置");*/
			timepoint = getVideoMillionSec();
		});
		/*aEL(video, "stalled",
		function() {
			console.log("事件:无法获取媒体");

		});*/
		/*aEL(video,"suspend",function(){*/
		/*console.log("事件:浏览器故意不加载媒体（ーー；）");*/
		/*});*/
		aEL(video, 'timeupdate',
		function() {
			/*console.log("事件:播放时间改变  "+video.currentTime);*/
			if (!player.video.paused) {
				player.assvar.isPlaying = true;
			}
			/*EVENT("timeupdate");*/
			/*controlfuns.refreshprogresscanvas();*/
			/*controlfuns.refreshtime();*/
			newTimePiece(getVideoMillionSec());
		});
		aEL(video, 'waiting',
		function() {
			/*console.log("事件:媒体缓冲中");*/
			/*newstat('缓冲中..');*/
			/*EVENT("waiting");*/
			player.assvar.isPlaying = false;
		});
	}

	player.cacheobj = {};
	player.assvar.hasZimu = false;
	player.assvar.hasSuperDanmu = false;
	/*initcacheobj();*/
	this.bind = function(player) {
		parentPlayer = player;
		setdom();
		initevents();
		danmufuns.start();
	};
	this.message = function(e) {
		if (e.type) {
			switch (e.type) {
			case "CTRL":
				{
					switch (e.msg.name) {
					case "videoaddress":
						{
							var videosrc = e.msg.src;
							for (var i = 0; i < videosrc.length; i++) {
								if (typeof videosrc[i] == 'string') {
									var s = c_ele('source');
									videosrc[i] = _string_.removesidespace(videosrc[i]);
									s.src = videosrc[i];
									player.video.appendChild(s);
									Dinfo('指定视频地址:', videosrc[i]);
								}
							}
							break;
						}
					case "danmuarray":
						{
							danmulist = e.msg.array;
							danmufuns.setTimeline();
							danmufuns.initFirer();
							break;
						}
						break;
					}
					break;
				}
			} 
		}else {
				Dlog(e);
		}
	}
}
window.danmuplayer = {
	DanmuCore: DanmuCore
};
/*字幕对象结构*/
/*{id:id,ty:5,c:"{主要结构}}",t:null,s:null,d:"2014-05-17"}

{start:10000,end:675470,content:"我了个喵",fontSize:50,rotate:30}
{time:12000,linear:true,x:100,y:200}
{time:15000,color:"#66ccff"}*/
/*字幕对象在时间轴中的结构
danmuarray[t][i]
.ty=5;
.fun=function
.obj=zimuobj*/
