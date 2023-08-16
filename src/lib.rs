#[cfg(test)]
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

mod facade;
mod instance;
mod module_cache;
mod net;
mod run;
mod runtime;
mod tasks;
mod tty;
mod utils;
mod ws;

pub use crate::{
    instance::{Instance, JsOutput},
    run::{run, RunConfig},
    runtime::Runtime,
    tty::{Tty, TtyState},
};

#[cfg(feature = "wat")]
use js_sys::{JsString, Uint8Array};
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(feature = "wat")]
#[wasm_bindgen]
pub fn wat2wasm(wat: JsString) -> Result<Uint8Array, utils::Error> {
    let wat = String::from(wat);
    let wasm = wasmer::wat2wasm(wat.as_bytes())?;
    Ok(Uint8Array::from(wasm.as_ref()))
}

#[wasm_bindgen(start)]
fn on_start() {
    if let Some(level) = tracing::level_filters::STATIC_MAX_LEVEL.into_level() {
        let cfg = tracing_wasm::WASMLayerConfigBuilder::new()
            .set_max_level(level)
            .build();
        tracing_wasm::set_as_global_default_with_config(cfg);
    }
}
