"use strict";

define(function () {
    return "\n\nvec3 rotateVectorByQuaternion( in vec3 v, in vec4 q ) {\n\n    vec3 dest = vec3( 0.0 );\n\n    float x = v.x, y  = v.y, z  = v.z;\n    float qx = q.x, qy = q.y, qz = q.z, qw = q.w;\n\n    // calculate quaternion * vector\n\n    float ix =  qw * x + qy * z - qz * y,\n          iy =  qw * y + qz * x - qx * z,\n          iz =  qw * z + qx * y - qy * x,\n          iw = -qx * x - qy * y - qz * z;\n\n    // calculate result * inverse quaternion\n\n    dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;\n    dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;\n    dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;\n\n    return dest;\n\n}\n\nvec4 axisAngleToQuaternion( in vec3 axis, in float angle ) {\n\n    vec4 dest = vec4( 0.0 );\n\n    float halfAngle = angle / 2.0,\n          s = sin( halfAngle );\n\n    dest.x = axis.x * s;\n    dest.y = axis.y * s;\n    dest.z = axis.z * s;\n    dest.w = cos( halfAngle );\n\n    return dest;\n\n}    \n    \n    ";
});
//# sourceMappingURL=vertex-shader-common.glsl.js.map