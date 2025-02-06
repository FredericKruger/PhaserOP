class LoaderJob {
    constructor(scene, textures, callBack){
        this.scene = scene;
        this.textures = textures;
        this.callBack = callBack;
    }
}

class DynamicTextureLoaderManager {

    constructor(){
        this.loadedTextures = [];

        this.isDoingJob = false;
        this.finishedJob = false;

        this.jobList = [];
    }

    addJob(job){
        this.jobList.push(job);

        if(!this.isDoingJob) this.doNext();
    }

    loadTextures(job) {
        let loader = new Phaser.Loader.LoaderPlugin(job.scene); //create a loader 

        for(let texture of job.textures) {
            if(!this.loadedTextures.includes(texture.key)) {
                this.loadedTextures.push(texture.key);
                loader.image(texture.key, texture.path);
            }
        }
        loader.once(Phaser.Loader.Events.COMPLETE, () => {
            job.callBack();

            this.finishedJob = true; 
            this.endJob();
        });
        loader.start();
    }

    endJob(){
        this.isDoingJob = false;

        if(this.finishedJob) this.jobList.shift();

        this.doNext();
    }

    doNext(){
        if(this.jobList.length>0){
            this.isDoingJob = true;
            this.finishedJob = false;
            this.loadTextures(this.jobList[0]);
        }
    }

    isBusy(){
        let busy = this.isDoingJob || this.jobList.length>0;
        return busy;
    }
}