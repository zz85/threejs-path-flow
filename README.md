# Path Flow aka Mesh Path Deformation Modifier

## About

It is called by different names (eg. "Curve Modifier" in Blender, Path-based Deformation, Bend Modifier), but what this does is that it can take a mesh and bend it along a curve or a path.

It's quite a work in progress and renders only in wireframe now.

Feel free to hack around with the code.

Examples: 

[Flow](https://zz85.github.io/threejs-flow-path/flow.html) - Allow a mesh to follow and bends along a path
[Bend](https://zz85.github.io/threejs-flow-path/bend.html) - Bend a mesh along another curve


Killer Whale Orca 3D Model from https://free3d.com/3d-model/killer-whale-89887.html

### Context

You can find the full story in this tweet. https://twitter.com/BlurSpline/status/966114594065326080

Basically I saw that @leon196 had built [a curve modifier for Unity3D](https://github.com/leon196/CurveModifier) and I thought there was no reason it cannot be done in js/web/threejs too.

The idea on how to do it was to apply some of the knowledge I already knew.

I first tried "bending" stuff writing TextGeometry in three.js.
(That eventually got removed due to complexity but the process build several of the foundation, eg. get tangents, spaced points etc).

Discovering and learning about calculating frenent frames was also important (writing tubes / extrude geometry)
https://github.com/mrdoob/three.js/issues/905

The most useful article I read about doing so was from prideout's blog post. http://prideout.net/blog/?p=56

Next steps was the usual - looking into threejs examples and picking up what could be used.
In this case, picking off the Spline Editor and Obj Loader examples.

Thanks to @mrdoob and @thespite for enouraging me to try this as usual.
