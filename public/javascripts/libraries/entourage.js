/*!
 * Entourage 1.1.0 - Automatic Download Tracking for Asynchronous Google Analytics
 *
 * Copyright (c) 2011 by Tian Valdemar Davis (http://techoctave.com/c7)
 * Licensed under the MIT (http://en.wikipedia.org/wiki/MIT_License) license.
 *
 * Learn More: http://techoctave.com/c7/posts/58-entourage-js-automatic-download-tracking-for-asynchronous-google-analytics
 */
(function(){var c=new function(){this.VERSION="1.1.0";var c=function(){var a,b;a=this.pathname;b=a.match(/\.pdf$|\.zip$|\.od*|\.doc*|\.xls*|\.ppt*|\.exe$|\.dmg$|\.mov$|\.avi$|\.mp3$/i);typeof b!=="undefined"&&b!==null&&(a=a.substring(0,a.indexOf("#")==-1?a.length:a.indexOf("#")),a=a.substring(0,a.indexOf("?")==-1?a.length:a.indexOf("?")),a=a.substring(a.lastIndexOf("/")+1,a.length),_gaq.push(["_trackPageview","/download/"+a]))};this.initialize=function(){for(var a=document.links,b=0,d=a.length;b<
d;b++)a[b].onclick=c}};window.entourage=c;window.onload=c.initialize})();