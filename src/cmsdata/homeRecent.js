import axios from 'axios';

let recentArray = []

const API_GET_PHOTOS = () => {
    return new Promise((resolve, reject) => {
            
        //Make the call 
        axios.get(`https://photo-cms.herokuapp.com/api/imageurl/recent/james@email.com`)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
        }
    ) 
}

  

// API_GET_PHOTOS.then(
//     response => {
//         console.log(response)
//         recentArray = response
//         return recentArray
//     },
//     err => console.log(err)
// )

export default API_GET_PHOTOS
    
