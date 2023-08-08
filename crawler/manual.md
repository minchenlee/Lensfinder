### Lens Model



|column name| type | description|
|:---|:---|:---|
|id|BigInteger|primary key|
|name|String(255)|lens name|
|image|String(255)|image url|
|url|String(255)|lens url|
|specification|JSON|lens specification|
|maker|String(32)|lens maker|
|mount|String(16)|lens mount|
|price|Float|lens price|
|COMS_size|String(16)|lens COMS size|


### lens model example
|column name| example value|
|:---|:---|
|name|XF8mmF3.5 R WR|
|image|https://fujifilm-x.com/wp-content/uploads/2023/05/1_thum_xf8mmf35-r-wr_rpnu_2.jpg|
|url|https://fujifilm-x.com/global/products/lenses/xf8mmf35-r-wr/|
|specification| [see here](#specificationExample)|
|maker|fujifilm|
|mount|X|
|price|799.95|
|COMS_size|APS-C|


### specification example<a name="specificationExample"></a>
#### table
|column name| example value|
|:---|:---|
|focal_length|8|
|max_aperture|3.5|
|optical_stabilization|false|
|weather_resistent|true|
|macro|false|
|low_dispersion|false|


#### example json
```json
{"focal_length": "8", 
"max_aperture": "3.5", 
"optical_stabilization": false, 
"weather_resistent": true, 
"macro": false, 
"low_dispersion": false}
```