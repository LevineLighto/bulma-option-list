const DataFetch = ({url, onfetched, onfail}) => {
    fetch(url, {method: 'get'})
    .then(response => {
        if(response.ok){
            return response.json();
        } else {
            throw new Error (`(Data Fetcher) ${response.status}: Something went wrong`);
        }
    }).then( data => onfetched(data))
    .catch( error => onfail(error));
}

export {DataFetch};