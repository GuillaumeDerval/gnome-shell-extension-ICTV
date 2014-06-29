const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Mainloop = imports.mainloop;
const ICTVPath = "/home/gderval/Desktop/ICTV/";
const UpdateDelay = 10;
const TransitionTime = 2.0;

let imageWidget1 = null;
let imageWidget2 = null;
let activeImageWidget = 0;
let _backgroundGroup = null;
let imageList = [];
let currentImage = -1;
let active = false;

function init()
{
	//nothing to do
}

// Get next image from the file ICTVPath/list
function getNextImage()
{
	imageList = Shell.get_file_contents_utf8_sync(ICTVPath+"list").split("\n");
	if(imageList.length == 0)
		return "";

	currentImage++;
	if(imageList.length <= currentImage)
		currentImage = 0;
	if(imageList[currentImage] == "")
	{
		return getNextImage();
	}

	return ICTVPath+imageList[currentImage];
}

// Assign next image to the invisible widget
function endUpdateImage()
{
	if(!active)
		return;
	let ni = getNextImage();
	if(ni == "")
		return;
	if(activeImageWidget == 1)
		imageWidget2.set_style("background-image:url('"+ni+"');");
	else
		imageWidget1.set_style("background-image:url('"+ni+"');");
}

//Tween the opacity of both images
function updateImage()
{
	if(!active)
		return false;

	if(activeImageWidget == 0) //init
	{
		let ni = getNextImage();
		if(ni == "")
			return false;
		imageWidget1.set_style("background-image:url('"+ni+"');");
		imageWidget1.opacity = 255;
		imageWidget2.opacity = 0;
		activeImageWidget = 1;
		endUpdateImage(); //init imageWidget2
	}
	else if(activeImageWidget == 1)
	{
		activeImageWidget = 2;
		Tweener.addTween(imageWidget1, {time: TransitionTime, transition:"easeOutQuad", onComplete:endUpdateImage, opacity:0});
		Tweener.addTween(imageWidget2, {time: TransitionTime, transition:"easeOutQuad", opacity:255});
	}
	else
	{
		activeImageWidget = 1; 
		Tweener.addTween(imageWidget1, {time: TransitionTime, transition:"easeOutQuad", opacity:255});
		Tweener.addTween(imageWidget2, {time: TransitionTime, transition:"easeOutQuad", onComplete:endUpdateImage, opacity:0});
	}
	return true;
}

function enable()
{
	currentImage = -1;
	activeImageWidget = 0;
	
	let monitor = Main.layoutManager.primaryMonitor;

	//Let's find the background
	if (_backgroundGroup == null)
	{
		let desktopActor = global.window_group.get_children();
		for(i=0;i<desktopActor.length;i++)
		{
			if(desktopActor[i] instanceof Meta.BackgroundGroup)
			{
				_backgroundGroup = desktopActor[i];
			}
		}
	}

    if (!imageWidget1)
	{
        imageWidget1 = new St.Widget({style_class: 'ictv-image'});
		_backgroundGroup.add_actor(imageWidget1);
    }

	if (!imageWidget2)
	{
        imageWidget2 = new St.Widget({style_class: 'ictv-image'});
		_backgroundGroup.add_actor(imageWidget2);
    }

    imageWidget1.opacity = 255;
    imageWidget1.set_position( monitor.width - imageWidget1.width - 16 + monitor.x, monitor.height - imageWidget1.height - 50 + monitor.y);

	imageWidget2.opacity = 0;
    imageWidget2.set_position( monitor.width - imageWidget2.width - 16 + monitor.x, monitor.height - imageWidget2.height - 50 + monitor.y);

	active = true;	

	updateImage(); //init
	Mainloop.timeout_add_seconds(UpdateDelay, updateImage);
}

function disable()
{
	active = false;
	if(!!imageWidget1)
	{
		imageWidget1.destroy();
		imageWidget1 = null;
	}
	if(!!imageWidget2)
	{
		imageWidget2.destroy();
		imageWidget2 = null;
	}
}
