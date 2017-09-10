---
layout: blogs/other/post
title:  "Baking Ambient Occlusion map in xNormal"
date:   2017-09-09 21:30:00 +0300
categories: textures
lang:   en
id:     7_ambient_occlusion_xnormal
---

1) Download and install **xNormal** from [http://www.xnormal.net/Downloads.aspx](http://www.xnormal.net/Downloads.aspx)

2) Prepare mesh in ```.obj``` ​format (in **PhotoScan** this can be done with model exporting)

3) Launch **xNormal**

4) On the right choose section ```High ​​definition ​​meshes​```, and than with **Right Click** -> ```Add ​​meshes​``` choose ```.obj``` ​​file:

![Add high mesh](/static/2017/09/10/01_add_high_mesh.png)

5) On the right choose section ```Low​ ​definition ​​meshes​```, and than with **Right Click** -> ```Add ​​meshes​``` choose the same ```.obj​```:

![Add low mesh](/static/2017/09/10/02_1_add_low_mesh.png)

6) In the right part of the same section ​enable ```Match ​​UVs​``` checkbox:

![Enable uv keeping](/static/2017/09/10/02_2_enable_uv_keeping.png)

7) Configure backing options (like ```Output ​​file``` ​​and ```Size​```) and press ```Generate​​ Maps​```:

![Backing options](/static/2017/09/10/03_backing_options.png)

8) Waiting for result make take some time (proportionally to result texture size and number of polygons in mesh):

![Waiting for result](/static/2017/09/10/04_wait_for_result.png)

9) When map generated - close the window:

![Close the results window](/static/2017/09/10/05_finished.png)

10) Check resulting Ambient Occlusion map (in ```Output ​​file​​``` configured in **step ​​7​**):

![Result AO texture](/static/2017/09/10/06_ao_texture.jpg)

11) More interesting to look at this AO texture on the model:

![AO textured mesh](/static/2017/09/10/07_ao_mesh.png)
