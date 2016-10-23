var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("Camera", ["require", "exports"], function (require, exports) {
    "use strict";
    var Camera = (function () {
        function Camera(position, target, scene) {
            this.position = position;
            this.target = target;
            this.scene = scene;
            this.fov = 45;
            this.up = [0.0, 1.0, 0.0];
            this.near = 1.0;
            this.far = 1000.0;
            this.scene.camera = this;
            this._viewMatrix = mat4.create();
            this._projectionMatrix = mat4.create();
            this._viewport = this.scene.engine.canvas;
        }
        Object.defineProperty(Camera.prototype, "viewMatrix", {
            get: function () {
                mat4.lookAt(this._viewMatrix, this.position, this.target, this.up);
                return this._viewMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "projectionMatrix", {
            get: function () {
                mat4.perspective(this._projectionMatrix, this.fov, this._viewport.width / this._viewport.height, this.near, this.far);
                return this._projectionMatrix;
            },
            enumerable: true,
            configurable: true
        });
        return Camera;
    }());
    exports.Camera = Camera;
});
define("Scene", ["require", "exports"], function (require, exports) {
    "use strict";
    var Scene = (function () {
        function Scene(engine, ambient) {
            this.engine = engine;
            this.ambient = ambient;
            this.meshes = {};
            this.sun = {
                direction: [0.0, -1.0, -0.5],
                diffuse: [1.0, 1.0, 1.0],
                specular: [0.7, 0.7, 0.7],
                intensity: 1.0
            };
            this.engine.scene = this;
        }
        Scene.prototype.render = function () {
            var gl = this.engine.gl;
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            for (var i in this.meshes)
                this.meshes[i].render();
        };
        return Scene;
    }());
    exports.Scene = Scene;
});
define("Mesh", ["require", "exports"], function (require, exports) {
    "use strict";
    var Mesh = (function () {
        function Mesh(name, scene) {
            this.name = name;
            this.scene = scene;
            this.uvBuffers = [];
            this.indexCount = 0;
            this._matrix = mat4.create();
            this.position = vec3.create();
            this.scale = [1.0, 1.0, 1.0];
            this.rotationX = 0.0;
            this.rotationY = 0.0;
            this.rotationZ = 0.0;
            this.scene.meshes[name] = this;
        }
        Object.defineProperty(Mesh.prototype, "matrix", {
            get: function () {
                mat4.identity(this._matrix);
                mat4.translate(this._matrix, this._matrix, this.position);
                mat4.rotateX(this._matrix, this._matrix, this.rotationX);
                mat4.rotateY(this._matrix, this._matrix, this.rotationY);
                mat4.rotateZ(this._matrix, this._matrix, this.rotationZ);
                mat4.scale(this._matrix, this._matrix, this.scale);
                return this._matrix;
            },
            enumerable: true,
            configurable: true
        });
        Mesh.prototype.render = function () {
            var gl = this.scene.engine.gl;
            this.scene.engine.materials[this.material].applyTo(this);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        };
        Mesh.prototype.free = function () {
            // @todo:
        };
        Mesh.create = function (name, scene, data) {
            var gl = scene.engine.gl;
            var positionsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.positions), gl.STATIC_DRAW);
            var normalsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normals), gl.STATIC_DRAW);
            var indicesBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW);
            var uvBuffers = [];
            for (var _i = 0, _a = data.uvs; _i < _a.length; _i++) {
                var uv = _a[_i];
                var uvBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
                uvBuffers.push(uvBuffer);
            }
            var mesh = new Mesh(name, scene);
            mesh.positionBuffer = positionsBuffer;
            mesh.normalBuffer = normalsBuffer;
            mesh.indexBuffer = indicesBuffer;
            mesh.uvBuffers = uvBuffers;
            mesh.indexCount = data.indices.length;
            return mesh;
        };
        return Mesh;
    }());
    exports.Mesh = Mesh;
});
define("shader/Attributes", ["require", "exports"], function (require, exports) {
    "use strict";
    var Attributes = (function () {
        function Attributes(shader, engine) {
            this.shader = shader;
            this.engine = engine;
            this.uvBuffers = {};
            this.uvAttributeLocations = {};
            this.initialize();
        }
        Attributes.prototype.initialize = function () {
            var gl = this.engine.gl;
            this.positionAttributeLocation = gl.getAttribLocation(this.shader.program, "position");
            if (this.positionAttributeLocation != -1) {
                gl.enableVertexAttribArray(this.positionAttributeLocation);
            }
            this.normalAttributeLocation = gl.getAttribLocation(this.shader.program, "normal");
            if (this.normalAttributeLocation != -1) {
                gl.enableVertexAttribArray(this.normalAttributeLocation);
            }
        };
        Object.defineProperty(Attributes.prototype, "position", {
            set: function (buffer) {
                this.positionBuffer = buffer;
                var gl = this.engine.gl;
                gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
                gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Attributes.prototype, "normal", {
            set: function (buffer) {
                this.normalBuffer = buffer;
                var gl = this.engine.gl;
                gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
                gl.vertexAttribPointer(this.normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
            },
            enumerable: true,
            configurable: true
        });
        Attributes.prototype.uv = function (name, buffer) {
            var gl = this.engine.gl;
            if (!(name in this.uvAttributeLocations))
                this.uvAttributeLocations[name] = gl.getAttribLocation(this.shader.program, name);
            if (this.uvAttributeLocations[name] != -1) {
                this.uvBuffers[name] = buffer;
                gl.enableVertexAttribArray(this.uvAttributeLocations[name]);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.vertexAttribPointer(this.uvAttributeLocations[name], 2, gl.FLOAT, false, 0, 0);
            }
            else {
                this.engine.logger.warn("Attribute variable '" + name + "' not found in this shader program.");
            }
        };
        return Attributes;
    }());
    exports.Attributes = Attributes;
});
define("shader/Uniforms", ["require", "exports"], function (require, exports) {
    "use strict";
    var Uniforms = (function () {
        function Uniforms(shader, engine) {
            this.shader = shader;
            this.engine = engine;
            this.uniforms = {};
        }
        Uniforms.prototype.sampler = function (name, texture, textureUnit) {
            if (textureUnit === void 0) { textureUnit = 0; }
            var gl = this.engine.gl;
            if (this.locationOf(name) != -1) {
                gl.activeTexture(gl.TEXTURE0 + textureUnit);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.uniform1i(this.locationOf(name), textureUnit);
            }
        };
        Uniforms.prototype.matrix4 = function (name, matrix4) {
            if (this.locationOf(name) != -1) {
                this.engine.gl.uniformMatrix4fv(this.locationOf(name), false, matrix4);
            }
        };
        Uniforms.prototype.matrix3 = function (name, matrix3) {
            if (this.locationOf(name) != -1) {
                this.engine.gl.uniformMatrix3fv(this.locationOf(name), false, matrix3);
            }
        };
        Uniforms.prototype.vector4 = function (name, vector4) {
            if (this.locationOf(name) != -1) {
                this.engine.gl.uniform4fv(this.locationOf(name), new Float32Array(vector4));
            }
        };
        Uniforms.prototype.vector3 = function (name, vector3) {
            if (this.locationOf(name) != -1) {
                this.engine.gl.uniform3fv(this.locationOf(name), new Float32Array(vector3));
            }
        };
        Uniforms.prototype.vector2 = function (name, vector2) {
            if (this.locationOf(name) != -1) {
                this.engine.gl.uniform2fv(this.locationOf(name), new Float32Array(vector2));
            }
        };
        Uniforms.prototype.float = function (name, float) {
            if (this.locationOf(name) != -1) {
                this.engine.gl.uniform1f(this.locationOf(name), float);
            }
        };
        Uniforms.prototype.integer = function (name, integer) {
            if (this.locationOf(name) != -1) {
                this.engine.gl.uniform1i(this.locationOf(name), integer);
            }
        };
        Uniforms.prototype.locationOf = function (name) {
            var gl = this.engine.gl;
            if (!(name in this.uniforms))
                this.uniforms[name] = gl.getUniformLocation(this.shader.program, name);
            if (this.uniforms[name] == -1)
                this.engine.logger.warn("Uniform variable with name '" + name + "' not found in this shader program.");
            return this.uniforms[name];
        };
        return Uniforms;
    }());
    exports.Uniforms = Uniforms;
});
define("Shader", ["require", "exports", "shader/Attributes", "shader/Uniforms"], function (require, exports, Attributes_1, Uniforms_1) {
    "use strict";
    var Shader = (function () {
        function Shader(vertexShaderSrc, fragmentShaderSrc, engine) {
            this.vertexShaderSrc = vertexShaderSrc;
            this.fragmentShaderSrc = fragmentShaderSrc;
            this.engine = engine;
        }
        Shader.prototype.compile = function () {
            var gl = this.engine.gl;
            this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(this.vertexShader, this.vertexShaderSrc);
            gl.compileShader(this.vertexShader);
            if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
                this.engine.logger.error(gl.getShaderInfoLog(this.vertexShader));
                return false;
            }
            this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(this.fragmentShader, this.fragmentShaderSrc);
            gl.compileShader(this.fragmentShader);
            if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
                this.engine.logger.error(gl.getShaderInfoLog(this.fragmentShader));
                return false;
            }
            return true;
        };
        Shader.prototype.link = function () {
            var gl = this.engine.gl;
            this.program = gl.createProgram();
            gl.attachShader(this.program, this.vertexShader);
            gl.attachShader(this.program, this.fragmentShader);
            gl.linkProgram(this.program);
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                this.engine.logger.error(gl.getProgramInfoLog(this.program));
                return false;
            }
            this._attributes = new Attributes_1.Attributes(this, this.engine);
            this._uniforms = new Uniforms_1.Uniforms(this, this.engine);
            return true;
        };
        Object.defineProperty(Shader.prototype, "attributes", {
            get: function () {
                if (this._attributes)
                    return this._attributes;
                this.engine.logger.warn("Shader must be compiled and linked before an accessing to attributes.");
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shader.prototype, "uniforms", {
            get: function () {
                if (this._uniforms)
                    return this._uniforms;
                this.engine.logger.warn("Shader must be compiled and linked before an accessing to uniforms.");
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Shader.prototype.use = function () {
            this.engine.gl.useProgram(this.program);
        };
        Shader.prototype.free = function () {
            // @todo:
        };
        return Shader;
    }());
    exports.Shader = Shader;
});
define("Material", ["require", "exports"], function (require, exports) {
    "use strict";
    var Material = (function () {
        function Material(name, shader, engine) {
            this.name = name;
            this.shader = shader;
            this.engine = engine;
            this.ambient = [0.0, 0.0, 0.0];
            this.diffuse = [1.0, 1.0, 1.0];
            this.specular = [0.5, 0.5, 0.5];
            this.emissive = [0.0, 0.0, 0.0];
            this.roughness = 40;
            this.engine.materials[name] = this;
        }
        Material.prototype.applyTo = function (mesh) {
            this.shader.use();
            // set attributes
            this.shader.attributes.position = mesh.positionBuffer;
            this.shader.attributes.normal = mesh.normalBuffer;
            // set uniforms
            // 1. material settings
            this.shader.uniforms.vector3("materialAmbient", this.ambient);
            this.shader.uniforms.vector3("materialDiffuse", this.diffuse);
            this.shader.uniforms.vector3("materialSpecular", this.specular);
            this.shader.uniforms.vector3("materialEmissive", this.emissive);
            this.shader.uniforms.float("materialRoughness", this.roughness);
            this.shader.uniforms.vector3("worldAmbient", mesh.scene.ambient);
            this.shader.uniforms.vector4("clipPlane", Material.clipPlane);
            this.shader.uniforms.integer("useClipPlane", Material.useClipPlane);
            // 2. scene matrices
            this.shader.uniforms.matrix4("modelMatrix", mesh.matrix);
            this.shader.uniforms.matrix4("viewMatrix", mesh.scene.camera.viewMatrix);
            this.shader.uniforms.matrix4("viewPosition", mesh.scene.camera.position);
            this.shader.uniforms.matrix4("projectionMatrix", mesh.scene.camera.projectionMatrix);
        };
        Material.clipPlane = [0.0, 1.0, 0.0, 0];
        Material.useClipPlane = 0;
        return Material;
    }());
    exports.Material = Material;
});
define("Texture", ["require", "exports"], function (require, exports) {
    "use strict";
    var Texture = (function () {
        function Texture(name, image, format, engine) {
            this.name = name;
            this.image = image;
            this.format = format;
            this.engine = engine;
            this.scaling = [1.0, 1.0];
            this.offset = [0.0, 0.0];
            this.rotation = 0.0;
            this._matrix = mat3.create();
            this.engine.textures[name] = this;
            this.object = this.create();
        }
        Texture.prototype.create = function () {
            var gl = this.engine.gl;
            var texture = gl.createTexture();
            var image = this.engine.images[this.image];
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, gl.UNSIGNED_BYTE, image);
            if (!this.isPowerOf2(image)) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
            else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
            return texture;
        };
        Texture.prototype.isPowerOf2 = function (image) {
            var logW = Math.log2(image.width), logH = Math.log2(image.height);
            return !(logW - Math.trunc(logW)) && !(logH - Math.trunc(logH));
        };
        Object.defineProperty(Texture.prototype, "matrix", {
            get: function () {
                mat3.identity(this._matrix);
                mat3.scale(this._matrix, this._matrix, this.scaling);
                mat3.rotate(this._matrix, this._matrix, this.rotation);
                mat3.translate(this._matrix, this._matrix, this.offset);
                return this._matrix;
            },
            enumerable: true,
            configurable: true
        });
        Texture.prototype.free = function () {
            // @todo:
        };
        return Texture;
    }());
    exports.Texture = Texture;
});
define("Logger", ["require", "exports"], function (require, exports) {
    "use strict";
    var Logger = (function () {
        function Logger() {
        }
        Logger.prototype.log = function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            console.log.apply(console, [message].concat(optionalParams));
        };
        Logger.prototype.error = function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            console.error.apply(console, [message].concat(optionalParams));
        };
        Logger.prototype.warn = function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            console.warn.apply(console, [message].concat(optionalParams));
        };
        Logger.prototype.info = function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            console.info.apply(console, [message].concat(optionalParams));
        };
        return Logger;
    }());
    exports.Logger = Logger;
});
define("AssetsManager", ["require", "exports", "Shader", "Texture", "Mesh"], function (require, exports, Shader_1, Texture_1, Mesh_1) {
    "use strict";
    var AssetsManager = (function () {
        function AssetsManager(engine) {
            this.engine = engine;
        }
        AssetsManager.prototype.loadShader = function (vertexUrl, fragmentUrl) {
            var _this = this;
            return Promise
                .all([fetch(vertexUrl).then(function (r) { return r.text(); }), fetch(fragmentUrl).then(function (r) { return r.text(); })])
                .then(function (programs) {
                var shader = new Shader_1.Shader(programs[0], programs[1], _this.engine);
                shader.compile();
                shader.link();
                return shader;
            });
        };
        AssetsManager.prototype.loadImage = function (name, url) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    resolve(img);
                };
                img.onerror = reject;
                img.src = url;
            })
                .then(function (img) {
                _this.engine.images[name] = img;
                return img;
            });
        };
        AssetsManager.prototype.loadTexture = function (name, url, format) {
            var _this = this;
            if (format === void 0) { format = "rgb"; }
            return this
                .loadImage(name, url)
                .then(function () {
                return new Texture_1.Texture(name, name, format == "rgb" ? _this.engine.gl.RGB : _this.engine.gl.RGBA, _this.engine);
            });
        };
        AssetsManager.prototype.loadMesh = function (url, scene) {
            return fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (json) {
                var mesh = Mesh_1.Mesh.create(json.name, scene, {
                    positions: json.positions,
                    indices: json.indices,
                    normals: json.normals,
                    uvs: [json.uvs]
                });
                mesh.position = json.position;
                mesh.rotationX = json.rotation[0];
                mesh.rotationY = json.rotation[1];
                mesh.rotationZ = json.rotation[2];
                mesh.scale = json.scaling;
                return mesh;
            });
        };
        return AssetsManager;
    }());
    exports.AssetsManager = AssetsManager;
});
define("Engine", ["require", "exports", "Logger", "AssetsManager"], function (require, exports, Logger_1, AssetsManager_1) {
    "use strict";
    var Engine = (function () {
        function Engine(canvas, clearColor) {
            if (clearColor === void 0) { clearColor = [0.0, 0.0, 0.0]; }
            this.images = {};
            this.textures = {};
            this.materials = {};
            this.logger = new Logger_1.Logger();
            this.canvas = canvas;
            this.canvas.width = canvas.clientWidth;
            this.canvas.height = canvas.clientHeight;
            this.clearColor = clearColor;
            this.gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
            this.assets = new AssetsManager_1.AssetsManager(this);
            this.initialize();
        }
        Engine.prototype.initialize = function () {
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.enable(this.gl.CULL_FACE);
            this.gl.cullFace(this.gl.BACK);
            this.gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1.0);
        };
        Engine.prototype.loop = function (after) {
            var _this = this;
            after = after || (function () { });
            var callable = function () {
                _this.scene.render();
                after(_this.scene);
                _this.animationId = requestAnimationFrame(callable);
            };
            this.animationId = requestAnimationFrame(callable);
        };
        Engine.prototype.stop = function () {
            cancelAnimationFrame(this.animationId);
        };
        return Engine;
    }());
    exports.Engine = Engine;
});
define("material/Diffuse", ["require", "exports", "Material"], function (require, exports, Material_1) {
    "use strict";
    var Diffuse = (function (_super) {
        __extends(Diffuse, _super);
        function Diffuse() {
            _super.apply(this, arguments);
        }
        Diffuse.prototype.applyTo = function (mesh) {
            _super.prototype.applyTo.call(this, mesh);
            this.engine.gl.cullFace(this.engine.gl.BACK);
            this.shader.attributes.uv("uv", mesh.uvBuffers[0]);
            this.shader.uniforms.vector3("sunDirection", mesh.scene.sun.direction);
            this.shader.uniforms.vector3("sunDiffuse", mesh.scene.sun.diffuse);
            this.shader.uniforms.vector3("sunSpecular", mesh.scene.sun.specular);
            this.shader.uniforms.float("intensity", mesh.scene.sun.intensity);
            this.shader.uniforms.sampler("texture", this.engine.textures[this.diffuseTexture].object, 0);
            this.shader.uniforms.matrix3("textureMatrix", this.engine.textures[this.diffuseTexture].matrix);
        };
        return Diffuse;
    }(Material_1.Material));
    exports.Diffuse = Diffuse;
});
define("material/Shadeless", ["require", "exports", "Material"], function (require, exports, Material_2) {
    "use strict";
    var Shadeless = (function (_super) {
        __extends(Shadeless, _super);
        function Shadeless() {
            _super.apply(this, arguments);
        }
        Shadeless.prototype.applyTo = function (mesh) {
            this.engine.gl.cullFace(this.engine.gl.FRONT);
            this.shader.use();
            this.shader.attributes.uv("uv", mesh.uvBuffers[0]);
            this.shader.attributes.position = mesh.positionBuffer;
            this.shader.uniforms.sampler("texture", this.engine.textures[this.diffuseTexture].object, 0);
            this.shader.uniforms.matrix3("textureMatrix", this.engine.textures[this.diffuseTexture].matrix);
            this.shader.uniforms.matrix4("modelMatrix", mesh.matrix);
            this.shader.uniforms.matrix4("viewMatrix", mesh.scene.camera.viewMatrix);
            this.shader.uniforms.matrix4("projectionMatrix", mesh.scene.camera.projectionMatrix);
            this.shader.uniforms.vector4("clipPlane", Material_2.Material.clipPlane);
            this.shader.uniforms.integer("useClipPlane", Material_2.Material.useClipPlane);
        };
        return Shadeless;
    }(Material_2.Material));
    exports.Shadeless = Shadeless;
});
define("FrameBuffer", ["require", "exports"], function (require, exports) {
    "use strict";
    var FrameBuffer = (function () {
        function FrameBuffer(width, height, engine) {
            this.width = width;
            this.height = height;
            this.engine = engine;
            this.initialize();
        }
        FrameBuffer.prototype.initialize = function () {
            var gl = this.engine.gl;
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
            var status;
            if ((status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)) != gl.FRAMEBUFFER_COMPLETE) {
                this.engine.logger.error("Framebuffer not ready. Status code: " + status);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };
        FrameBuffer.prototype.activate = function () {
            var gl = this.engine.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer);
        };
        FrameBuffer.prototype.deactivate = function () {
            var gl = this.engine.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };
        FrameBuffer.prototype.free = function () {
            // @todo:
        };
        return FrameBuffer;
    }());
    exports.FrameBuffer = FrameBuffer;
});
define("material/Water", ["require", "exports", "Material", "FrameBuffer"], function (require, exports, Material_3, FrameBuffer_1) {
    "use strict";
    var Water = (function (_super) {
        __extends(Water, _super);
        function Water(name, shader, engine) {
            _super.call(this, name, shader, engine);
            this.name = name;
            this.shader = shader;
            this.engine = engine;
            this.wind = [0.01, 0.01];
            this.wave = [0.4, 0.02];
            this.color = [0.9, 1.0, 1.0];
            this.time = 0;
            this.windMatrix = mat3.create();
            this.offsetDate = Date.now();
            this.reflectionBuffer = new FrameBuffer_1.FrameBuffer(this.engine.canvas.width, this.engine.canvas.height, this.engine);
            this.refractionBuffer = new FrameBuffer_1.FrameBuffer(this.engine.canvas.width, this.engine.canvas.height, this.engine);
        }
        Water.prototype.applyTo = function (mesh) {
            delete this.engine.scene.meshes[mesh.name];
            this.renderReflection();
            this.renderRefraction();
            this.engine.scene.meshes[mesh.name] = mesh;
            this.engine.gl.cullFace(this.engine.gl.FRONT);
            this.shader.use();
            this.shader.attributes.position = mesh.positionBuffer;
            this.shader.attributes.normal = mesh.normalBuffer;
            this.shader.attributes.uv("uv", mesh.uvBuffers[0]);
            this.shader.uniforms.matrix4("modelMatrix", mesh.matrix);
            this.shader.uniforms.matrix4("viewMatrix", mesh.scene.camera.viewMatrix);
            this.shader.uniforms.matrix4("projectionMatrix", mesh.scene.camera.projectionMatrix);
            this.shader.uniforms.vector3("viewPosition", mesh.scene.camera.position);
            this.shader.uniforms.vector4("clipPlane", Material_3.Material.clipPlane);
            this.shader.uniforms.integer("useClipPlane", 0);
            this.shader.uniforms.matrix3('windMatrix', this.windMatrix);
            this.shader.uniforms.vector2('wave', this.wave);
            this.shader.uniforms.sampler('normalTexture', this.engine.textures[this.normalTexture].object, 0);
            this.shader.uniforms.sampler('reflectionTexture', this.reflectionBuffer.texture, 1);
            this.shader.uniforms.sampler('refractionTexture', this.refractionBuffer.texture, 2);
            this.shader.uniforms.vector3('color', this.color);
            this.shader.uniforms.vector3("sunDirection", mesh.scene.sun.direction);
            this.shader.uniforms.vector3("sunSpecular", mesh.scene.sun.specular);
            this.time = (Date.now() - this.offsetDate) / 1000;
            mat3.identity(this.windMatrix);
            mat3.translate(this.windMatrix, this.windMatrix, [this.wind[0] * this.time, this.wind[1] * this.time]);
        };
        Water.prototype.renderRefraction = function () {
            Material_3.Material.clipPlane = [0.0, -1.0, 0.0, 0.05];
            Material_3.Material.useClipPlane = 1;
            this.refractionBuffer.activate();
            this.engine.scene.render();
            this.refractionBuffer.deactivate();
            Material_3.Material.useClipPlane = 0;
        };
        Water.prototype.renderReflection = function () {
            Material_3.Material.clipPlane = [0.0, 1.0, 0.0, 0.01];
            Material_3.Material.useClipPlane = 1;
            this.reflectionBuffer.activate();
            this.engine.scene.camera.position[1] = -this.engine.scene.camera.position[1];
            this.engine.scene.camera.up[1] = -this.engine.scene.camera.up[1];
            this.engine.scene.render();
            this.engine.scene.camera.up[1] = -this.engine.scene.camera.up[1];
            this.engine.scene.camera.position[1] = -this.engine.scene.camera.position[1];
            this.reflectionBuffer.deactivate();
            Material_3.Material.useClipPlane = 0;
        };
        return Water;
    }(Material_3.Material));
    exports.Water = Water;
});
define("Control", ["require", "exports"], function (require, exports) {
    "use strict";
    var Control = (function () {
        function Control(canvas) {
            var _this = this;
            this.canvas = canvas;
            this.spyCursor = false;
            this.cursorPos = { x: 0, y: 0 };
            this.moveSpeed = 0.1;
            this.rotateSpeed = 0.005;
            this.radius = 10.0;
            this.alpha = 0.0;
            this.betta = 0.0;
            this.canvas.addEventListener("mousedown", function (e) {
                _this.mouseDown(e);
            });
            this.canvas.addEventListener("mouseup", function () {
                _this.mouseUp();
            });
            this.canvas.addEventListener("mousemove", function (e) {
                _this.mouseMove(e);
            });
        }
        Control.prototype.attachTo = function (camera) {
            this.camera = camera;
            this.calcAngles();
        };
        Control.prototype.destroy = function () {
            this.canvas.removeEventListener("mousedown", this.mouseDown);
            this.canvas.removeEventListener("mouseup", this.mouseUp);
            this.canvas.removeEventListener("mousemove", this.mouseMove);
        };
        Control.prototype.mouseDown = function (event) {
            this.spyCursor = true;
            this.cursorPos.x = event.clientX;
            this.cursorPos.y = event.clientY;
        };
        Control.prototype.mouseUp = function () {
            this.spyCursor = false;
            this.calcAngles();
        };
        Control.prototype.mouseMove = function (event) {
            if (this.spyCursor) {
                var position = [this.radius, 0.0, 0.0];
                var alpha = Math.PI * (event.clientX - this.cursorPos.x) * this.rotateSpeed + this.alpha;
                var betta = Math.PI * (event.clientY - this.cursorPos.y) * this.rotateSpeed + this.betta;
                vec3.rotateZ(position, position, [0, 0, 0], betta);
                vec3.rotateY(position, position, [0, 0, 0], alpha);
                this.camera.position = position;
            }
        };
        Control.prototype.calcAngles = function () {
            var line = vec3.create();
            vec3.sub(line, this.camera.target, this.camera.position);
            this.radius = vec3.len(line);
            this.alpha = -Math.atan(line[2] / line[0]);
            this.betta = Math.acos(line[1] / this.radius);
        };
        return Control;
    }());
    exports.Control = Control;
});
define("bootstrap", ["require", "exports", "Engine", "Scene", "material/Diffuse", "material/Shadeless", "material/Water", "Camera", "Control"], function (require, exports, Engine_1, Scene_1, Diffuse_1, Shadeless_1, Water_1, Camera_1, Control_1) {
    "use strict";
    var canvas = document.getElementById("viewport");
    var engine = new Engine_1.Engine(canvas);
    var scene = new Scene_1.Scene(engine, [0.0, 0.0, 0.0]);
    Promise
        .all([
        engine.assets.loadMesh("assets/water.json", scene),
        engine.assets.loadMesh("assets/ground.json", scene),
        engine.assets.loadMesh("assets/skybox.json", scene),
        engine.assets.loadShader("assets/shaders/diffuse.vertex.fx", "assets/shaders/diffuse.fragment.fx"),
        engine.assets.loadShader("assets/shaders/shadeless.vertex.fx", "assets/shaders/shadeless.fragment.fx"),
        engine.assets.loadShader("assets/shaders/water.vertex.fx", "assets/shaders/water.fragment.fx"),
        engine.assets.loadTexture("skybox", "assets/skybox.jpg"),
        engine.assets.loadTexture("ground", "assets/ground.jpg"),
        engine.assets.loadTexture("wave", "assets/wave.png")
    ])
        .then(function (assets) {
        var time = 0;
        var water = assets[0], ground = assets[1], skybox = assets[2];
        var skyboxMaterial = new Shadeless_1.Shadeless("skybox", assets[4], engine);
        skyboxMaterial.diffuseTexture = "skybox";
        skybox.material = "skybox";
        var groundMaterial = new Diffuse_1.Diffuse("ground", assets[3], engine);
        groundMaterial.diffuseTexture = "ground";
        ground.material = "ground";
        var waterMaterial = new Water_1.Water("water", assets[5], engine);
        waterMaterial.normalTexture = "wave";
        water.material = "water";
        var camera = new Camera_1.Camera([0.0, 5.0, -5.0], [0, 0.0, 0], scene);
        camera.fov = 45;
        var control = new Control_1.Control(canvas);
        control.attachTo(camera);
        // delete scene.meshes.Water;
        engine.loop(function () {
            // assets[7].offset[0] = Math.PI * time;
            time += 0.001;
            // scene.meshes['Skybox'].rotationZ = Math.PI * time;
        });
    });
});
