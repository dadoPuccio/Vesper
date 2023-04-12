const MergingShader = {

	uniforms: {
        tDiffuse: {value: null},
        tOcclusion: {value: null}
    },

	vertexShader: /* glsl */`

	    varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader: /* glsl */`

        uniform sampler2D tDiffuse;
        uniform sampler2D tOcclusion;
        
        varying vec2 vUv;
        
        void main() {
            vec4 originalColor = texture(tDiffuse, vUv);
            vec4 scatteringColor = texture(tOcclusion, vUv);
            gl_FragColor = originalColor + scatteringColor;
        }`

};

export { MergingShader };