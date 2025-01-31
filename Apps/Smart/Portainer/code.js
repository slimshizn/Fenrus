﻿class Portainer 
{
    authorize(args) {
        let username = args.properties['username'];
        let password = args.properties['password'];
        if(!username)
            return;
        let res;
        try
        {
            res = args.fetch({
                url: 'api/auth',
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ username: username, password: password })
            }).data;
            if(!res)
                return;
            if(res.jwt)
                return res.jwt;
            if(res.message)
                throw res.message;
        }
        catch(err)
        {
            throw err;
        }
        if(res && res.body)
            throw res.body;
        throw 'Failed to authorize Portainer';
    }

    status(args) {
        let jwt = this.authorize(args);
        if(!jwt) {
            args.log('Not configured');
            return '';
        }
        let data = args.fetch({
            url: 'api/endpoints?limit=100&start=0',
            headers: { 'Authorization': 'Bearer ' + jwt}
        }).data;
        let running = 0;
        let stopped = 0;

        if (data && typeof (data[Symbol.iterator]) === 'function') {
            for (let instance of data) {
                if (instance?.Snapshots) {
                    for (let snapshot of instance.Snapshots) {
                        running += snapshot.RunningContainerCount;
                        stopped += snapshot.StoppedContainerCount;
                    }
                }
            }
        }
        return args.liveStats([
            ['Running', running],
            ['Stopped', stopped]
        ]);
    }
    
    test(args) {
        return !!(this.authorize(args));
    }
}
