﻿class GOG {
    dataAge;
    data;
    dataIndex = 0;
    fetch(args, url) {
        return args.fetch(url).data;
    }

    getData(args)
    {        
        if(this.data?.length && this.dataAge && this.dataAge >= new Date().getTime() - (10 * 60 * 1000)){
            ++this.dataIndex;

            if(this.dataIndex >= this.data.length - 1)
                this.dataIndex = 0;
            return this.data[this.dataIndex];
        }

        let results = this.getOnSale(args) || [];
        this.data = results;
        this.dataIndex = 0;
        this.dataAge = new Date().getTime();
        return this.data[this.dataIndex];
    }


    getOnSale(args){
        let currency = args.properties['currency'] || 'AUD';
        let country = args.properties['country'] || 'NZ';
        let data = this.fetch(args, `https://menu.gog.com/v1/store/configuration?locale=en-US&currency=${currency}&country=${country}`);
        args.log('data: ' + data);
        if(!data || !data['on-sale-now'] || isNaN(data['on-sale-now'].products?.length))
            return;

        let onSale = data['on-sale-now'].products;
        let results = [];
        for(let product of onSale)
        {
            let item = this.getItem(product, args);
            if(item)
                results.push(item);
        }
        return results;
    }

    getItem(data, args) {
        if(!data)
            return;
        let currencySymobol = args.properties['currencySymobol'] || '$';
        let item = {};
        item.title = data.title;
        item.image = 'https:' + data.image + '_product_tile_304.webp';
        item.id = data.id;        
        item.link = 'https://www.gog.com' + data.url;
        item.price = data.price.isFree ? 'FREE' : currencySymobol + data.price.amount;
        item.discount = data.price.isFree ? '100%' : data.price.discountPercentage + '%';
        return item;
    }

    status(args) {

        if(args.size === 'small' || args.size === 'medium')
            return;
        
        if(!this)
            return 'this is null';
        if(!this.getData)
            return 'get data is null';

        let item = this.getData(args);
        if(!item) 
        {
            return "item is null";
        }
        
        return args.carousel(this.data.map(x => {
            return this.getItemHtml(args, x);
        }));
    }

    getItemHtml(args, item) {
        return `
        <div class="gog fill" style="background-image:url('${args.Utils.htmlEncode(item.image)}');">
            
            <div class="name tr">${args.Utils.htmlEncode(item.title)}</div>
            <div class="price br">
                ${item.price}
            </div>
            <div class="discount bl">
                <div class="down-icon"><span class="icon-arrow-left"></span></div>
                ${item.discount}
            </div>
            <a class="cover-link" target="${args.linkTarget}" href="${item.link}" />
            <a class="app-icon" target="${args.linkTarget}" href="${args.Utils.htmlEncode(args.url)}"><img src="${args.appIcon || '/apps/GOG/icon.png'}?version=${args.version}" /></a>
        </div>
        `;
    }
}