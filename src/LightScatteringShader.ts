import {Vector2} from "three";

const LightScatteringShader = {

	uniforms: {
        tDiffuse: {value: null},
        lightPos: {value: new Vector2(0., 0.)},
        decay: {value: 0.99},
        density: {value: 0.8},
        weight: {value: 0.8},
		exposure: {value: 0.05},
        n_samples: {value: 150}
    },

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		uniform vec2 lightPos;
		uniform float decay;
		uniform float density;
		uniform float exposure;
		uniform float weight;
		uniform int n_samples;
		
		varying vec2 vUv;

		void main() {
			vec2 ray = vUv - lightPos;
			vec2 delta = ray * (1. / float(n_samples)) * density;
			vec4 color = texture(tDiffuse, vUv);
			vec2 currentPos = vUv;
			float illuminationDecay = 1.;
		
			for (int i = 1; i < n_samples; ++i){
				currentPos -= delta;
				vec4 sampleColor = texture(tDiffuse, currentPos);

				sampleColor *= illuminationDecay * weight;
				color += sampleColor;

				illuminationDecay *= decay;
			}
		
			gl_FragColor = color * exposure;
		}`

};

export { LightScatteringShader };