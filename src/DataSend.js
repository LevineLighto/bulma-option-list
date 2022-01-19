const DataSend  = ({url, options, onsuccess, onfail}) => {
    fetch (url, options)
    .then ( response => {
        if( response.ok ) return response.json();
        else throw new Error( `(Data Sender) ${response.status}: Something went wrong` );
    }).then ( data => onsuccess(data))
    .catch ( error => onfail(error));
}

export {DataSend};