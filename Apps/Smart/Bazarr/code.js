﻿class Bazarr
{
	doFetch (args, endpoint) {
        return args.fetch({
            url: 'api/' + endpoint + '?apikey=' + args.properties['apiKey'], 
			timeout: 1500
        }).data;
    }  
	
    status(args) {
		
		let data = this.doFetch(args,'badges');
        let historyData = this.doFetch(args,'history/stats');
		
		let movieCount = 0;
		let seriesCount = 0;
		
		if(historyData?.movies.length > 3) {
			for(let i = 1; i < 4; ++i){
				movieCount += historyData?.movies[historyData?.movies?.length - i].count;
			}	
		}
		if(historyData?.series.length > 3) {
			for(let i = 1; i < 4; ++i){
				seriesCount += historyData?.series[historyData?.series?.length - i].count;
			}
		}
		
        return args.liveStats([
            ['Episodes Recent DL',  seriesCount],
			['Episodes Wanted',  (data?.episodes ?? 0)],
			['Movies Recent DL',  movieCount],
			['Movies Wanted',  (data?.movies ?? 0)]
        ]);
    }
    
    test(args) {
        let data = this.doFetch(args,'system/status');
        return data?.data?.bazarr_version != null;
    }
}

