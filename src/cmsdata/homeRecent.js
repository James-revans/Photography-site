import axios from 'axios';

const API_GET_RECENT = () => {
    return new Promise((resolve, reject) => {
            
        //Make the call 
        axios.get(`https://photo-cms-api.onrender.com/api/imageurl/recent/james@email.com`)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
        }
    ) 
}

  

// API_GET_RECENT.then(
//     response => {
//         console.log(response)
//         recentArray = response
//         return recentArray
//     },
//     err => console.log(err)
// )

export default API_GET_RECENT
    
