﻿class FileFlows
{
    pfImages = {};
    
    fetch(args, url) {
        let prefix = args.url;
        if(prefix.endsWith('/') === false)
            prefix += '/';
        url = prefix + url;
        args.log('Fetching URL: ' + url);
        if(!args.properties["apiToken"])
            return args.fetch(url).data;

        return args.fetch({
            url: url,
            method: 'GET',
            headers: {
                'x-token': args.properties['apiToken']                
            }            
        }).data;
    }
    
    status(args)
    {
        let data = this.fetch(args, 'remote/info/status');
        let shrinkage = this.fetch(args, 'remote/info/shrinkage-groups');
        let updateAvailable = this.updateAvailable(args);

        args.setStatusIndicator(updateAvailable ? 'update' : '');

        if (!data || isNaN(data.queue)) {
            throw 'no data';
        }

        if(args.size.indexOf('large') >= 0) {
            return this.statusXLarge(args, data, shrinkage);
        }
        else
            return this.statusMedium(args, data);
    }

    updateAvailable(args){
        let data = this.fetch(args, 'remote/info/update-available');
        if(data.exception)
        {
            args.log('Exception fetching update-available: ' + (data.message || 'Unknown reason'));
            return false;
        }
        let result = data?.UpdateAvailable === true;
        return result;
    }

    getStatusIndicator(args){
        if(this.updateAvailable(args))
            return 'update';
        return 'recording';
    }
    

    statusXLarge(args, data, shrinkage){
        if(!data.processingFiles?.length){
            if(shrinkage?.length)
                return this.statusShrinkage(args, shrinkage)
            return this.statusMedium(args, data);
        }

        if(!this.pfImages)
            this.pfImages = {};
        
        let items =  [];
        for(let item of data?.processingFiles || [])
        {
            
            if(this.pfImages[item.name] === undefined)
            {
                let searchTerm = item.relativePath.replace(/\\/g, '/');
                if(/([^\/]+)s[\d]+e[\d]+/i.test(searchTerm)){
                    searchTerm = /([^\/]+)s[\d]+e[\d]+/i.exec(searchTerm)[1];
                    args.log('searchTerm', searchTerm);
                    searchTerm = searchTerm.replace(/\./g, ' ');
                }
                else if(/([^\/]+)(720p|1080p|4k|3840|BluRay)/i.test(searchTerm)){
                    searchTerm = /([^\/]+)(720p|1080p|4k|3840|480|576|BluRay)/i.exec(searchTerm)[1];
                    searchTerm = searchTerm.replace(/(720|1080|3840|480|576)[ip]/gi, '');
                    searchTerm = searchTerm.replace(/\./g, ' ');
                }
                else {
                    searchTerm = searchTerm.substring(searchTerm.lastIndexOf('/') + 1);
                }
                args.log('FileFlows search term: ' + searchTerm);
                let images = args.imageSearch(searchTerm);
                this.pfImages[item.name] = images?.length ? images[0] : '';
            }
            let image = this.pfImages[item.name];
            items.push({
                file: item.relativePath,
                library: item.library,
                step: item.step,
                stepPercent: item.stepPercent,
                image: image
            });
        }
        let max = args.size === 'x-large' ? 7 : 10;
        if(items.length > max)
            items.splice(max);
        
        return args.carousel(items.map(x => {
            return this.getItemHtml(args, x);
        }));
    }

    statusMedium(args, data){
        let secondlbl = 'Time';
        let secondValue = data.time;

        if (!data.time) {
            if (!data.processing) {
                secondlbl = 'Processed';
                secondValue = data.processed;
            }
            else {
                secondlbl = 'Processing';
                secondValue = data.processing;
            }
        } 

        return args.liveStats([
            ['Queue', data.queue],
            [secondlbl, secondValue]
        ]);    
    }
    statusShrinkage(args, shrinkage){
        let items = [];
            
        for(let item of shrinkage) 
        {            
            let increase = item.FinalSize > item.OriginalSize;
            let percent;
            let tooltip;
            if(item.FinalSize === 0)
            {
                percent = 100;
                tooltip = 'No Change';
            }
            else if(increase){
                percent = 100 + ((item.FinalSize - item.OriginalSize) / item.OriginalSize * 100);
                tooltip = args.Utils.formatBytes(item.FinalSize - item.OriginalSize) + ' Increase';
            }else{
                percent = (item.FinalSize / item.OriginalSize) * 100;
                tooltip = args.Utils.formatBytes(item.OriginalSize - item.FinalSize) + ' Saved';
            }
            items.push({
                label: item.Library === '###TOTAL###' ? 'Total' : item.Library,
                percent: percent,
                tooltip: tooltip,
                icon: '/common/hdd.svg'
            });
        }
        
        return args.barInfo(items);
    }
    
    getItemHtml(args, item) {
        let title = args.Utils.htmlEncode(item.title);
        if(item.grandParentTitle){
            title = args.Utils.htmlEncode(item.grandParentTitle) + '<br/>' + title;
        }
        else if(item.parentTitle){
            title = args.Utils.htmlEncode(item.parentTitle) + '<br/>' + title;
        }
        return `
<div class="fileflows fill" style="background-image:url('${args.Utils.htmlEncode(item.image)}');">    
    <div class="name tr wrap">${item.file}</div>
    <div class="br">${item.library}</div>
    ${item.stepPercent ? `<div class="bl">${item.stepPercent.toFixed(1)}%</div>` : ''}
    <a class="cover-link" target="${args.linkTarget}" href="${args.Utils.htmlEncode(args.url)}" />
    <a class="app-icon" target="${args.linkTarget}" href="${args.Utils.htmlEncode(args.url)}"><img src="${args.appIcon || '/apps/FileFlows/icon.png'}?version=${args.version}" /></a>
</div>
`;
    }

    test(args){        
        let data = this.fetch(args, 'remote/info/status');
        args.log('data: ' + (data === null ? 'null' : JSON.stringify(data)));
        return isNaN(data.processed) === false;          
    }
}
