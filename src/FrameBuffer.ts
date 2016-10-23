import {Engine} from './Engine';

export class FrameBuffer implements Resource
{
    public texture:WebGLTexture;
    public buffer:WebGLFramebuffer;

    private depthBuffer:WebGLRenderbuffer;

    public constructor(public width, public height, public engine:Engine)
    {
        this.initialize();
    }

    public initialize()
    {
        let gl = this.engine.gl;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        this.buffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);

        let status;
        if((status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)) != gl.FRAMEBUFFER_COMPLETE) {
            this.engine.logger.error("Framebuffer not ready. Status code: " + status);
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    public activate()
    {
        let gl = this.engine.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer);
    }
    
    public deactivate()
    {
        let gl = this.engine.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    
    public free()
    {
        // @todo:
    }
}