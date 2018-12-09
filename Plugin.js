'use strict'

class ExtractFilePlugin {

    apply(compiler) {
        const pluginName = 'ExtractFilePlugin';

        compiler.hooks.thisCompilation.tap(pluginName, compilation => {

            compilation.hooks.normalModuleLoader.tap(pluginName, (loaderContext, module) => {
                loaderContext[__dirname] = () => {
                    module.buildMeta[__dirname] = true;
                };
            });

            compilation.hooks.additionalAssets.tapAsync(pluginName, callback => {
                compilation.chunks.forEach(chunk => {
                    for(const module of chunk.modulesIterable) {
                        processModule(chunk, module);
                    }
                });

                callback();
            });
        });
    }
}

function processModule(chunk, ourModule) {

    if (ourModule.buildMeta && ourModule.buildMeta[__dirname]) {

        let moduleFound = false;

        // let's find module, which was issued by ours (proxied module)
        for(const module of chunk.modulesIterable) {
            if (!moduleFound && module.reasons.some(reason => reason.module === ourModule)) {
                // add assets from that module
                addAssets(chunk, module);
                // break cycle
                moduleFound = true;
            }
        };
    }
}

function addAssets(chunk, module) {

    // add any emitted assets via proxied module to this chunk
    for (let file in module.assets) {
        chunk.files.push(file);
    }
}

module.exports = ExtractFilePlugin;
