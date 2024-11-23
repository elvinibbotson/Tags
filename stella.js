var tab={}; // tab object
var folder=null; // Stella bookmarks folder ID
var checklist=[]; // list of tags to match in search
chrome.tabs.query({lastFocusedWindow: true, active: true},tabDetails);
icons=['house','building','factory','ruin','bed','camping','caravan','car',
'truck','tractor','bus','train','motorbike','bicycle','walking','plane',
'holidays','globe','world','map','location','weather','temperature','water',
'energy','solar','battery','windmill','leaf','tree','flowers','animals',
'birds','insects','pets','fish','DIY','sport','puzzle','books',
'clothes','shopping','food','drink','money','moneybox','math','science',
'electronics','audio','music','guitar','art','photos','camera','video',
'tv','games','smartphone','phone','computer','health','ideas','coding'];
// var selection=[]; // selected icons
var selection=[];
id('logo').addEventListener('click',function(){
	id('help').style.display='block';
});
id('help').addEventListener('click',function(){
	id('help').style.display='none';
})
id('stamp').addEventListener('click',function() {
	if(tab.title.length>30) tab.title=tab.title.substr(0,28)+'..';
	for(var i=0;i<selection.length;i++) {
		console.log('select '+icons[selection[i]]);
		tab.title+='$'+icons[selection[i]];
	}
	console.log('title: '+tab.title+'\nurl: '+tab.url);
	addBookmark(folder,tab.title,tab.url);
	message('SAVED');
	window.setTimeout(function(){window.close();},2000);
});
id('search').addEventListener('click',function() {
	checklist=[];
	for(var i=0;i<selection.length;i++) {
		console.log('add label $'+icons[selection[i]]);
		checklist.push(icons[selection[i]]);
	}
	console.log('get bookmarks in Stella folder - id: '+folder);
	chrome.bookmarks.getChildren(folder).then(listMatches);
});
id('close').addEventListener('click',function() {
	for(var i=0;i<icons.length;i++) id('icons').childNodes[i].style.backgroundColor='white';
	id('listPage').style.display='none';
});
id('icons').addEventListener('click',function(event) {
	var x=event.x-5;
	var y=event.y;
	console.log('click at '+x+','+y);
	x=Math.floor(x/50); // was x=Math.floor(x/50);
	y=Math.floor((y-75)/51);// was y=Math.floor((y-90)/50);
	console.log('icon '+x+' on row '+y);
	var n=y*8+x;
	console.log('icon '+n);
	if((n<0)||(n>63)) {
		message('miss!');
		return;
	}
	var i=selection.indexOf(n);
	if(i<0) {
		selection.push(n);
		id('icons').childNodes[n].style.backgroundColor='silver';
		message(icons[n]);
	}
	else {
		selection.splice(i,1);
		id('icons').childNodes[n].style.backgroundColor='white';
	}
	console.log('selected: '+selection);
})
// check for Stella bookmarks
var found=false;
chrome.bookmarks.search({title:'Stella'},
(results)=>{
	for(const result of results){
		console.log(result);
		if(result.title==='Stella') {
			found=true;
			folder=result.id;
		}
	}
	if(found) console.log('Stella bookmarks folder exists - id: '+folder);
	else makeFolder();
});
// populate with icons
var html;
var image;
for(var i=0;i<icons.length;i++) {
	html='<img src="icons/'+icons[i]+'.png" alt="'+icons[i]+'"/>';
	id('icons').innerHTML+=html;
}
// create special bookmarks folder
function makeFolder() {
	chrome.bookmarks.create({title: 'Stella'},
	()=>{console.log('bookmark folder added');}
);}
function addBookmark(id,title,url) {
	chrome.bookmarks.create({parentId: id, title: title, url: url}),
	()=>{console.log('bookmark added');}
}
function tabDetails(tabs) {
	tab.title=tabs[0].title;
	tab.url=tabs[0].url;
	console.log('tab: '+tab.title+'; url: '+tab.url);
	// return tab;
}
function listMatches(bookmarks) {
	console.log(' bookmarks found: '+bookmarks);
	var page='';
	var url='';
	var match=false;
	var found=0;
	var listItem;
	var html='<b>Search for</b>';
	for(var i in selection) html+='<img src="icons/'+icons[selection[i]]+'.png" align="middle" >';
	id('listHeader').innerHTML=html;
	id('list').innerHTML='';
	for(i=0;i<bookmarks.length;i++) {
		page=bookmarks[i].title;
		url=bookmarks[i].url;
		match=true; // start off assuming this page is a match
		for(var j=0;j<checklist.length;j++) {
			if(page.indexOf('$'+checklist[j])<0) match=false; 
		}
		if(match) {
			console.log(page+' is a match');
			found++;
			listItem=document.createElement('li');
			listItem.index=i; // index in bookmarks
			html=page.substring(0,page.indexOf('$'));
			html+='<img src="icons/close.png" class="deleteIcon">';
			html+='<br><small>'+url.substring(0,50)+'</small>';
			listItem.innerHTML=html;
			listItem.addEventListener('click',function(e) {
				var item=bookmarks[this.index];
				if(e.x>380) {
					chrome.bookmarks.remove(bookmarks[this.index].id);
					bookmarks.splice(this.index,1);
					window.close();
					return;
				}
				else {
	 				console.log('display page '+bookmarks[this.index].title+'; URL: '+bookmarks[this.index].url);
	 				chrome.tabs.create({url: bookmarks[this.index].url});
	 				window.close();
				}
			});
			id('list').appendChild(listItem);
		}
		else console.log(page+' does not match');
	}
	console.log(found+' matches');
	if(found<1) id('list').innerHTML+='NO MATCHES';
	id('listPage').style.display='block';
	checklist=[];
	selection=[];
	console.log('selection and checklist cleared');
}
function displayPage(index) {
	console.log('display page '+bookmarks[i].title+'; URL: '+bookmarks[i].url);
}
function deleteBookmark(bookmark) {
	console.log('delete '+bookmark.title);
	chrome.bookmarks.remove(bookmark.id);
	// bookmarks.splice(n,1);
	listMatches(bookmarks);
}
function message(text) {
	id('message').innerText=text;
	id('message').style.display='block';
	window.setTimeout(function(){id('message').style.display='none';},2000);
}
function id(el) {
	return document.getElementById(el);
}