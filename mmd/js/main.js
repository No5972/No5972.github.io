let scene, renderer, camera, mesh, helper, effect;

let ready = false;

//browser size
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

//Obujet Clock
const clock = new THREE.Clock();


const Pmx = "./pmx/mlj/mlj.pmx";
const MotionObjects = [
  { id: "float_with_rotate", VmdClip: null, AudioClip: false },
  { id: "kei_voice_009_1", VmdClip: null, AudioClip: false },
  { id: "kei_voice_010_2", VmdClip: null, AudioClip: false },
  { id: "1", VmdClip: null, AudioClip: false },
  { id: "loop", VmdClip: null, AudioClip: false },
];

window.onload = () => {
  Init();

  LoadModeler();

  Render();
}

/*
 * Initialize Three
 * camera and right
 */
Init = () => {
  scene = new THREE.Scene();

  const ambient = new THREE.AmbientLight(0xcccccc);
  // scene.add(ambient);

        spotLight = new THREE.SpotLight();
        spotLight.color = new THREE.Color(0xffffff);

        spotLight.castShadow = true;

        spotLight.position.set(0, -10, 60);

        // 光的强度 默认值为1
        spotLight.intensity = 1;
        // 从发光点发出的距离，光的亮度，会随着距离的远近线性衰减
        spotLight.distance = 350;
        // 光色散角度，默认是 Math.PI * 2
        spotLight.angle = 0.4;
        // 光影的减弱程度，默认值为0， 取值范围 0 -- 1之间
        spotLight.penumbra = 0.1;
        // 光在距离上的量值, 和光的强度类似（衰减指数）
        spotLight.decay = 1;

        // 设置阴影分辨率
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        // 投影近点 --> 从距离光源的哪一才产生阴影
        spotLight.shadow.camera.near = 0.1;
        // 投影原点 --> 到光源的哪一点位置不产生阴影
        spotLight.shadow.camera.far = 300;
        // 投影视场
        spotLight.shadow.camera.fov = 40;

        scene.add(spotLight);


  renderer = new THREE.WebGLRenderer({ alpha: true });
  effect = new THREE.OutlineEffect( renderer, {
    defaultThickness: 0.01,
    defaultColor: [ 0, 0, 0 ],
    defaultAlpha: 0.8,
    defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
  } );
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(480 * window.innerWidth / window.innerHeight, 480);
  renderer.setClearColor(0xcccccc, 0);
  renderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild(renderer.domElement);

  //cameraの作成
  camera = new THREE.PerspectiveCamera(40, windowWidth / windowHeight, 1, 1000);
  camera.position.set(0, 18, 52);
  effect.render( scene, camera );


  // documentにMMDをセットする

}

/*
 * Load PMX and VMD and Audio
 */
LoadModeler = async () => {
  const loader = new THREE.MMDLoader();

  //Loading PMX
  LoadPMX = () => {
    return new Promise(resolve => {
      loader.load(Pmx, (object) => {
        mesh = object;
        mesh.caseShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        resolve(true);
      }, onProgress, onError);
    });
  }

  //Loading VMD
  LoadVMD = (id) => {
    return new Promise(resolve => {
      const path = "./vmd/" + id + ".vmd";
      const val = MotionObjects.findIndex(MotionObject => MotionObject.id == id);

      loader.loadAnimation(path, mesh, (vmd) => {
        vmd.name = id;

        MotionObjects[val].VmdClip = vmd;

        resolve(true);
      }, onProgress, onError);
    });
  }

  //Load Audio
  LoadAudio = (id) => {
    return new Promise(resolve => {
      const path = "./audio/" + id + ".mp3";
      const val = MotionObjects.findIndex(MotionObject => MotionObject.id == id);

      if (MotionObjects[val].AudioClip) {
        new THREE.AudioLoader().load(path, (buffer) => {
          const listener = new THREE.AudioListener();
          const audio = new THREE.Audio(listener).setBuffer(buffer);
          MotionObjects[val].AudioClip = audio;

          resolve(true);
        }, onProgress, onError);
      } else {
        resolve(false);
      }
    });
  }

  // Loading PMX...
  await LoadPMX();

  // Loading VMD...
  await Promise.all(MotionObjects.map(async (MotionObject) => {
    return await LoadVMD(MotionObject.id);
  }));

  // Loading Audio...
  await Promise.all(MotionObjects.map(async (MotionObject) => {
    return await LoadAudio(MotionObject.id);
  }));

  //Set VMD on Mesh
  VmdControl("float_with_rotate", true);
}

/*
 * Start Vmd and Audio.
 * And, Get Vmd Loop Event
 */
VmdControl = (id, loop) => {
  const index = MotionObjects.findIndex(MotionObject => MotionObject.id == id);

  // Not Found id
  if (index === -1) {
    console.log("not Found ID");
    return;
  }

  ready = false;
  helper = new THREE.MMDAnimationHelper({ afterglow: 0.0, resetPhysicsOnLoop: true });

  // 
  helper.add(mesh, {
    animation: MotionObjects[index].VmdClip,
    physics: false
  });

  //Start Audio
  if (MotionObjects[index].AudioClip) {
    MotionObjects[index].AudioClip.play();
  }

  const mixer = helper.objects.get(mesh).mixer;
  //animation Loop Once
  if (!loop) {
    mixer.existingAction(MotionObjects[index].VmdClip).setLoop(THREE.LoopOnce);
  }

  // VMD Loop Event
  mixer.addEventListener("loop", (event) => {
    console.log("loop");
  });

  // VMD Loop Once Event
  mixer.addEventListener("finished", (event) => {
    console.log("finished");
    VmdControl("loop", true);
  });

  ready = true;
}



/*
 * Loading PMX or VMD or Voice
 */
onProgress = (xhr) => {
  if (xhr.lengthComputable) {
    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log(Math.round(percentComplete, 2) + '% downloaded');
  }
}

/* 
 * loading error
 */
onError = (xhr) => {
  console.log("ERROR");
}

/*
 * MMD Model Render
 */
Render = () => {
  requestAnimationFrame(Render);
  renderer.clear();
  renderer.render(scene, camera);

  if (ready) {
    helper.update(clock.getDelta());
    // effect.render( scene, camera );
  }
}

/*
 * Click Event
 */
PoseClickEvent = (id) => {
  switch (id) {
    case "pose1":
      VmdControl("loop", true);
      break;

    case "pose2":
      VmdControl("float_with_rotate", true);
      break;

    case "pose3":
      VmdControl("1", false);
      break;

    default:
      VmdControl("loop", true);
      break;
  }
}