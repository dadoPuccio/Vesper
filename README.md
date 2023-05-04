# Vesper

<p align="center">
  <img src="https://github.com/dadoPuccio/Vesper/blob/master/images/logo.png" />
</p>

**Vesper** is an implementation of Kenny Mitchell's post-processing algorithm for volumetric light scattering effect presented [here](https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process).  

Live demo is available on github pages [at this link](https://dadopuccio.github.io/Vesper/).

## Built with
* [Typescript](https://www.typescriptlang.org/)
* [Three.js](https://www.typescriptlang.org/)
* [Yuka](https://mugen87.github.io/yuka/)
* [Vite](https://vitejs.dev/guide/features.html)

## Local installation
In order to run the application on your device you need a working [npm](https://www.npmjs.com) installation.  

After downloading the files run:  
``` npm install ```  
on the project directory.

Then, to run the **developer build**, use:  
``` npm run dev ```  
and open the link provided by Vite (typically ``` http://localhost:5173/Vesper/ ```).

Alternatively, to run the **production build**, use:  
``` npm run dev ```  
``` npm run preview ```  
and open the link provided by Vite (typically ``` http://localhost:4173/Vesper/ ```).

## Scenes
Two scenes are available:

### Table Scene
<p align="center">
  <img src="https://github.com/dadoPuccio/Vesper/blob/master/images/TableScene.png" width="800px" />
</p>

### Flying Scene
<p align="center">
  <img src="https://github.com/dadoPuccio/Vesper/blob/master/images/FlyingScene.png" width="800px" />
</p>

## Credits
The following 3D models from [Sketchfab](https://sketchfab.com/) were used:
* [Chandelier Black](https://sketchfab.com/3d-models/chandelier-black-c66c187d0ed44d759d2b6564fbc83a9c)
* [Simple Dining Table](https://sketchfab.com/3d-models/simple-dining-table-a6deba91a7f9435082369e33f8db0dd6)
* [Star Wars TIE Fighter](https://sketchfab.com/3d-models/star-wars-tie-fighter-7168fab6ee2a4c62979c3dbfa05458f0)
* [X-Wing](https://sketchfab.com/3d-models/x-wing-6fdd3b18c4b245bf9eba1fd32611496a)

## Acknowledgements
This project is the assignment for the course of Computer Graphics and 3D, held by professor Stefano Berretti at University of Florence.
