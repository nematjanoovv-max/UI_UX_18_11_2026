import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  TriangleFanDrawMode,
  TriangleStripDrawMode,
  TrianglesDrawMode,
  Vector3
} from "three";

function mergeGeometries(geometries, useGroups = false) {
  const isIndexed = geometries[0].index !== null;
  const attributesUsed = new Set(Object.keys(geometries[0].attributes));
  const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
  const attributes = {};
  const morphAttributes = {};
  const mergedGeometry = new BufferGeometry();
  let offset = 0;

  for (let i = 0; i < geometries.length; ++i) {
    const geometry = geometries[i];
    let attributesCount = 0;
    if (isIndexed !== (geometry.index !== null)) return null;
    for (const name in geometry.attributes) {
      if (!attributesUsed.has(name)) return null;
      if (attributes[name] === undefined) attributes[name] = [];
      attributes[name].push(geometry.attributes[name]);
      attributesCount++;
    }
    if (attributesCount !== attributesUsed.size) return null;
    if (useGroups) {
      let count;
      if (isIndexed) {
        count = geometry.index.count;
      } else if (geometry.attributes.position !== undefined) {
        count = geometry.attributes.position.count;
      } else {
        return null;
      }
      mergedGeometry.addGroup(offset, count, i);
      offset += count;
    }
  }

  for (const name in attributes) {
    const mergedAttribute = mergeAttributes(attributes[name]);
    if (!mergedAttribute) return null;
    mergedGeometry.setAttribute(name, mergedAttribute);
  }

  return mergedGeometry;
}

function mergeAttributes(attributes) {
  let ArrayType;
  let arrayLength = 0;
  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i];
    if (ArrayType === undefined) ArrayType = attribute.array.constructor;
    arrayLength += attribute.array.length;
  }
  const array = new ArrayType(arrayLength);
  let offset = 0;
  for (let i = 0; i < attributes.length; ++i) {
    array.set(attributes[i].array, offset);
    offset += attributes[i].array.length;
  }
  return new BufferAttribute(array, attributes[0].itemSize, attributes[0].normalized);
}

export { mergeGeometries, mergeGeometries as mergeBufferGeometries, mergeAttributes };
