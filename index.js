require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");
const sharp = require('sharp');
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");
const ffmpeg = require("fluent-ffmpeg")()
.setFfprobePath(ffprobe.path)
.setFfmpegPath(ffmpegInstaller.path);



const dataVariable = {
  USERNAME : process.env.IG_USERNAME,
  PASSWORD : process.env.IG_PASSWORD,
  userInstagram:{
    0:'adamsenatori',
    1:'brahmino',
    2:'ilhan1077',
    3:'jonpauldouglass',
    4:'haakeaulana',
    5:'packtography',
    6:'cschoonover',
    7:'mthiessen',
    8:'abu888',
    9:'macenzo',
    10:'othellonine',
    11:'aaronbhall',
    12:'monaris_',
  },
  keyInput :{
    0:'Animezation',
    1:'Morphing',
    2:'Avatar Anime',
    3:'Digital Art Transformation ',
    4:'Anime Portrait Generator',
    5:'Anime Style Rendering',
    6:'Cartoonify',
    7:'Anime Filter',
    8:'Character Transformation',
    9:'Anime Character Creation',
    10:'Facial Features Enhancement',
    11:'Anime Hair Styling',
    12:'Background Art Integration',
  } , 
  ig : new IgApiClient(),
  dataPath: "datas",
  cookiesPath : 'cookies',
  workFlow:{ // keyinput get from local ui-comfu :: 3000
    0: {nameWorkFlow:'imgandtext2img_v1',typeOutPut:"image",keyInput:{
      "3": {
        "clip": [
          "381",
          1
        ],
        "text": " girl, beautiful, full body, surrounding scenery"
      },
      "4": {
        "clip": [
          "381",
          1
        ],
        "text": "embed: nice, good quality, scale 1080x1080 pixels"
      },
      "37": {
        "image": "1705166003270 (1).png",
        "upload": "image"
      },
      "105": {
        "image": "AnimateDiff_00001_.png",
        "upload": "image"
      }
    }},
    1: {nameWorkFlow:'img2vid_v1',typeOutPut:"vid",keyInput:{
      "23": {
        "image": "1705767394027.png",
        "upload": "image"
      }
    }}
  },
MAX_SIZE_BYTES : 100 * 1024,// 100KB
 MAX_QUALITY : 65 ,
}
 const {USERNAME,PASSWORD,userInstagram,ig,workFlow , MAX_QUALITY,keyInput } = dataVariable
 let {dataPath,cookiesPath} = dataVariable
 




// handle flow code

 async function main() {  //1 login 
  console.log("login",USERNAME); 
  ig.state.generateDevice(USERNAME);
  cookiesPath =  `${cookiesPath}/${dataVariable.USERNAME}.json`

  try { 
    if (fs.existsSync(cookiesPath)) { // 2 login use cookies
      let data = fs.readFileSync(cookiesPath, { encoding: "utf-8" });
      await ig.state.deserialize(data);
      console.log("log use cookies");

      //3 get img from instagram and handle in (confyui + lavel) -> post instagram
    
      workFlowGetHandleAndPost(0) // key from obj workflow

      return

      
    } else { // 1 login and save cookies
      console.log("not exists");

      await ig.account.login(USERNAME, PASSWORD); // login use acc
      const serialized = await ig.state.serialize();  // export cookies
      fs.writeFileSync(cookiesPath, JSON.stringify(serialized), { // save cookies
        encoding: "utf-8",
      });
      console.log("save success cookies pl rerun code ");
      return
    }
  } catch (e) {
    console.log(e);
    console.log(
      "if err login, pl delete cookies end rerun code to save new cookies"
    );
  }
}










//////////// func config
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const convertBufferToBase64 = (file) => {
  const bufferData = Buffer.from(file);
  return `data:image/png;base64,${bufferData.toString("base64")}`

};

function updateJsonFile(filePath, jsonObject) {


  let keys = Object.keys(jsonObject); // get arrObj

  keys.shift(); // delete first key
  let firstKey = keys[0];

  // 
  let newJsonObject = {}; // convert to obj
  keys.forEach(key => {
    if(key === firstKey){
      newJsonObject[0] = jsonObject[key];
    }else{
      newJsonObject[key] = jsonObject[key];
    }
  });

  let updatedJsonData = JSON.stringify(newJsonObject, null, 2);   // write file
  fs.writeFileSync(filePath, updatedJsonData, 'utf-8');

  console.log(`File JSON updated.`);
}

const handleGetData = async (userName) =>{
  const user = await ig.search.users(userName);  // get User from name
  await delay(2000);
  const idUser = user[0].pk_id;  // get idUser From User
  await delay(2000);
  const feedUser = ig.feed.user(idUser);  // get user feed from id
  await delay(2000);
  const itemsUser = await feedUser.items();  // get items feed from user
  const dataImg = itemsUser.map((item) => {  // get image from item
  return item.image_versions2.candidates[0];
  });

  const imageBuffer = await get({   // get buffer from link img
    url: dataImg[0].url,
    encoding: null,
  });
  const base64String = convertBufferToBase64(imageBuffer);  // convert buffer to base64
  updateJsonFile(dataPath, dataImg)  //  delete imageData[0] bc return  
  return base64String  //  return base64(images[0])
}

const randomKeyWork = async()=>{
  const objInput = []
  for(let i = 0 ; i< 5; i++){
    const randomInput = Math.floor(Math.random() * Object.keys(keyInput).length);
    objInput.push(keyInput[randomInput])
  }
  return objInput

}

// func handle api instagram
async function getDataFromUser(userName) 
{  
  console.log(dataPath)

  if (fs.existsSync(dataPath)  ) { // check jsondata ? return base64(images[0])
    let datajson = fs.readFileSync(dataPath, { encoding: "utf-8" })
    datajson = JSON.parse(datajson)
    if(datajson[0]){
      console.log(
        `exists data for ${userName}:::${dataPath} pl delete ${userName}.json to recall api`
      );
      let imageData = fs.readFileSync(dataPath, { encoding: "utf-8" });  //read  string Json Img
      imageData = JSON.parse(imageData);  // convert string to json
      const imageBuffer = await get({   // get buffer from link img
        url: imageData[0].url,
        encoding: null,
      });
      updateJsonFile(dataPath, imageData) // delete imageData[0] bc return  
      const base64String = convertBufferToBase64(imageBuffer);  // convert buffer to base64
      return base64String  //  return base64(images[0])
    }else{
      return handleGetData(userName)
     
    }

  }else{
    return handleGetData(userName)
  }

}

async function getDataFromHastag(hashtagName) {
  const feedHashTag = ig.feed.tags(hashtagName);
  const itemsHastag = await feedHashTag.items();
  const dataImg = itemsHastag[0].image_versions2;
  console.log(dataImg);
}

const postImageToInsta = async (urlImage,descriptionImage) => {

  try{
    const imageBuffer = await get({
      url: urlImage,
      encoding: null, 
  });


   const resizedImageBuffer = await sharp(imageBuffer)
   .jpeg({ quality: MAX_QUALITY }) 
   .toBuffer();  

  await ig.publish.photo({
    file: resizedImageBuffer,
    caption: descriptionImage,
  });
  console.log("post success")

  }catch(e){
    console.log(e)
  }
  
}
const postReelsToInsta = async (urlVid,base64Image,depcrition) =>{
    
    const base64DataImage = base64Image.replace(/^data:image\/\w+;base64,/, ''); // handle base64 to buffer
    const imageBuffer = Buffer.from(base64DataImage, 'base64');
    const resizedImageBuffer = await sharp(imageBuffer) // handle file image
     .jpeg({ quality: MAX_QUALITY }) 
     .toBuffer();  

   
     try {
       // Lấy buffer từ URL của file GIF
         const gifBuffer = await get({ 
           url: urlVid,
           encoding: null, 
         });
         fs.writeFileSync('tempGif.gif', gifBuffer);
         
         ffmpeg
         .input('tempGif.gif')
         .outputOptions([
           "-pix_fmt yuv420p",
           "-c:v libx264",
           "-movflags +faststart",
           "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
         ])
         .noAudio()
         .output(`tempGif.mp4`)
         .on("end", async() => {
           try {
            // read file
            const mp4Buffer = fs.readFileSync('tempGif.mp4');
      
            await ig.publish.video({
              video: mp4Buffer,
              coverImage: resizedImageBuffer,
              isClip: true,
              clipsPreviewToFeed: true,
              caption: depcrition,
            });
            console.log("Upload success");
          } catch (e) {
            console.log("err post:", e);
          }
         })
         .on("error", (e) => console.log(e))
         .run();
      
     }catch (error) {
       throw error;
     }


}



// func service
const handleUploadImgToComfyui = async (base64) => {

  const res = await axios.post(process.env.POSTIMAGE, { // call api post image to comfyui server
    base64: base64,
  }, { headers: {
    Authorization: process.env.Authorization
  } });
  return res.data.message; // return file name image in comfyuisss
};
const handleWorkFlowComfy = async (nameImage,dataWorkFlow) =>{
  const resworkFlow = await axios.post(process.env.GETWORKFLCOMFYUI, {  // get workfl comfyui bt name
  nameWorkflow: dataWorkFlow.nameWorkFlow
}, { headers: {
  Authorization: process.env.Authorization
} });

   const workflow = resworkFlow.data.message.jsonWorkflow
  
if(dataWorkFlow.typeOutPut === "image"){
    // // handle output img  : last node not image
    for (const key in workflow) { 
      if (workflow.hasOwnProperty(key)) {
        if(workflow[key].class_type === "SaveImage"){
          if(key<999){
            workflow[999] = workflow[key]
            delete  workflow[key]
          }
    
        }  
      }
    }
}

  // random keywork for text input comfyui
  const randomInput = randomKeyWork() // randomKeyWork.lenght = 5


 let jsonKeyInput = dataWorkFlow["keyInput"]

  // update jsonKeyInput : from workFlow[keyWorkFlow].keyInput and update data| example

     ////// workFlow[0].keyInput: ///////
  jsonKeyInput[3].text = `${randomInput[0]} ${randomInput[1]}`
  jsonKeyInput[4].text = "dip: worst quality, worst quality, super low capacity 100kb,:1.2, 9:16 ratio with image size 1080x1920"
  jsonKeyInput[37].image = nameImage
  jsonKeyInput[105].image = nameImage

    ////// workFlow[1].keyInput: ///////
   //jsonKeyInput[23].image = nameImage



  

  for (let key in jsonKeyInput) { // match jsonKeyInput
    if (workflow.hasOwnProperty(key)) {
      workflow[key].inputs = jsonKeyInput[key];
    }
 }

  const res = await axios.post(process.env.POSTQUEUE,{ // post workfl to comfyui
    jsonWl:workflow
  }, { headers:{
    Authorization: process.env.Authorization
  } });
  return res.data.message //return link output



}
const handleLlava = async(urlImage) =>{
    const res = await axios.post(process.env.GETTEXT, {  // call api to handle get depcription from images
      load_8bit: true,
      image_url: urlImage,
      prompt: "What is this, simple description in about 10 words"
    })  
    let message = res.data.message
    let modifiedMessage = message.slice(0, -4);  // delete ..."</s>""
    return modifiedMessage  // return mes description for image
 
}



// func handle flow

const workFlowGetHandleAndPost = async (keyWorkFlow) =>{ 
  const dataWorkFlow = workFlow[keyWorkFlow]
  const randomKey = Math.floor(Math.random() * Object.keys(userInstagram).length);
  const userName = userInstagram[randomKey];
   dataPath = `${dataPath}/${userName}.json`;

  try{
    const base64 = await getDataFromUser(userName); // get base64(image[0]) from data user instagram   done
    const nameImage = await handleUploadImgToComfyui(base64); // upload file img from instagram and return filename img in comfyui done
    const urlComfyui = await handleWorkFlowComfy(nameImage,dataWorkFlow)  // handle image by comfyui runturn url Image after handle in comfyui  done
    console.log(urlComfyui) // log output
    if(dataWorkFlow.typeOutPut === "image"){
    const descriptionImage = await handleLlava(urlComfyui); // get description Image by  Llava done
    return await postImageToInsta(urlComfyui,descriptionImage)  // post content to Instagram   // err
    }else{
    //const descriptionImage = await handleLlava(urlComfyui); 
    return await postReelsToInsta(urlComfyui,base64,"abc test") 
    }
  }catch(e){
    console.log(e)
  }

}


/// run code
main()

// how ? choose key obj work flow in main()  -> changle input work in handleWorkFlowComfy()
// flow
// 1: check cookies ? login use cookies : login use acc
// 2: run work flow


// workflow: 
// 1 check data json image ? get new data images : use data json image current         => update jsonfile() and  return base64(image[0]) (95%)
// 2 upload image from base64(image[0])    => return => name image in comfyui  => done
// 3 handle image in comfyui (name image in comfyui)    => return   uri(image)  => done
// 4 get text image Llava  uri(image) ==> return text    done
// 5 post content to instagram (uri(image),text)   err IgResponseError: POST /... 400 Bad Request;


// write code -> flow

