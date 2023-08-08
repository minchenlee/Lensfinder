import requests
import re
from bs4 import BeautifulSoup
from model.lens_model import write_to_database, delete_from_database, update_to_database, auto_to_database
import pprint
import json

# get html
def send_request(url):
    # headers = {"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0"}
    headers = {"User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) GSA/7.0.55539 Mobile/12H143 Safari/600.1.4"}
    response = requests.get(url, headers=headers, timeout=10)
    return response.text, response.status_code


# parse html
def soupify(html):
    soup = BeautifulSoup(html,'html.parser')
    return soup


# print pretty html
def pretty_print(soup):
    print(soup.prettify())


# lazy pack
def quick_peek(url):
    response, status_code = send_request(url)
    soup = soupify(response)
    print("status code: " + str(status_code))
    print(soup.prettify())


# 整合兩個資料來源的鏡頭資料
def find_matches_lens(origin, foreign):
    origin = origin.replace(" ","").replace("Lens", "").replace("/", "").lower()  # 去除空白和 Lens(canon)
    foreign = foreign.replace(" ","").replace("/", "").lower() # 去除 / (nikon)


    if (origin in foreign and "FACTORY REFURBISHED" not in foreign): # 去除 factory refurbished(fujifilm)
        return True
    
    return False


# lens class
class lens():
    def __init__(self):
        self.name = ""
        self.image = ""
        self.url = ""
        self.specification = {}
        self.maker = ""
        self.mount = ""
        self.price = 100000000
        self.weight = 0
        self.CMOS_size = ""
        self.type = ""

    def print(self):
        print("name: " + self.name)
        print("image: " + self.image)
        print("url: " + self.url)
        print("specification: " + str(self.specification))
        print("maker: " + self.maker)
        print("mount: " + str(self.mount))
        print("price: " + str(self.price))
        print("weight: " + str(self.weight))
        print("COMS_size: " + self.CMOS_size)
        print("type: " + self.type)
        print("--------------------")

    # 正規表達式搜尋
    def regex_search(self, regex, string):
        if re.search(regex, string):
            return True
        else:
            return False
    
    # extract type
    def extract_type(self):
        name = self.name.lower().replace(" ","")

        if (self.regex_search(r'\d+-\d+mm', name)):
            self.type = "zoom"
            return

        elif self.regex_search(r'\d+mm', name):
            self.type = "prime"
            return
        
        # nikon and canon and sony
        elif (self.regex_search(r'TC', name) | self.regex_search(r'Extender', name) | self.regex_search(r'teleconverter', name) | self.regex_search(r'converter', name)):
            self.type = "converter"
            return

        elif (self.regex_search(r'Kit', name)):
            self.type = "kit"
            return

        
    def import_from_soup(self):
        pass

    def import_from_dict(self):
        pass

    def compensate_lens_info(self):
        pass


# fujifilm lens class
class fujifilm_lens(lens):
    def import_from_soup(self, soup):
        self.name = soup.find("h3").getText().replace('NEW', '')
        self.url = soup.find("a").get('href')
        self.image = soup.find("img").get('src')
        self.maker = "fujifilm"
        self.mount = "X"
        self.CMOS_size = "aps-c"
        self.type = "prime"


        # 取得鏡頭規格
        focal_length = self.name.split("mm")[0].replace("XF", "").replace("XC", "")
        max_aperture = self.name.split(" ")[0].split("mmF")[1]
        optical_stabilization = self.regex_search(r'\bOIS\b', self.name)
        weather_resistent = self.regex_search(r'\bWR\b', self.name)
        macro = self.regex_search(r'\bMacro\b', self.name)
        low_dispersion = self.regex_search(r'\bAPD\b', self.name)

        self.specification = {
            "focal_length": focal_length,
            "max_aperture": max_aperture,
            "optical_stabilization": optical_stabilization,
            "weather_resistent": weather_resistent,
            "macro": macro,
            "low_dispersion": low_dispersion
        }

    # 從另一個 data source 補償鏡頭資訊
    def compensate_lens_info(self):
        url = 'https://shopusa.fujifilm-x.com/precision/products?has_price=true&search=&category%5B%5D=LENSES&brand%5B%5D=X-Series&per_page=68&sort_direction=DESC'
        lens_json, status_code = send_request(url)
        lens_info_dict = json.loads(lens_json)

        for lens_info in lens_info_dict['results']:
            # 找到對應的鏡頭
            is_matched = find_matches_lens(self.name, lens_info['name'])

            # 如果有找到對應的鏡頭，就補償價格資訊
            if(is_matched):
                self.price = float(lens_info['price'])


# nikon lens class
class nikon_lens(lens):
    def compensate_lens_spec_info(self, url):
        weather_resistent = False
        low_dispersion = False

        response, status_code = send_request(url)
        soup = soupify(response)

        # 取得 weather resistent 資訊
        overview = soup.find("ul", {"class": "c-list"}).getText()
        weather_resistent = True if "dust- and drip-resistant" in overview else False

        # 取得 low dispersion 資訊
        product_spec_tags = soup.find("ul", {"class": "mod-productSpec-inner"}).getText()
        low_dispersion = True if "ED" in product_spec_tags else False

        return weather_resistent, low_dispersion


    def import_from_soup(self, soup):
        if (soup.find("h4")):
            self.name = soup.find("h4").getText()
        
        if (soup.find("h3")):
            self.name = soup.find("h3").getText()

        self.url = 'https://imaging.nikon.com' + soup.find("a").get('href')
        self.image = 'https://imaging.nikon.com' + soup.find("img").get('src')
        self.maker = "nikon"
        self.CMOS_size = soup.find("span", {"class": "mod-specIcon2-text1"}).getText().lower()

        if ("Z" in self.name and "Zoom" not in self.name):
            self.mount = "Z"
            

        else :
            self.mount = "F"
        
        # 取得鏡頭規格
        focal_length = re.sub(r"[^\d-]", "", self.name.split("mm")[0].split(" ")[-1])
        optical_stabilization = self.regex_search(r'\bVR\b', self.name)
        macro = self.regex_search(r'\bMC\b', self.name)


        # 取得鏡頭類型（定焦、變焦、焦段轉換器）
        self.extract_type()

        # 取得鏡頭光圈
        raw_aperuture = re.search(r'f/(\d+(?:\.\d*)?)', self.name)
        max_aperture = raw_aperuture.group(1) if raw_aperuture else None

        # 取得鏡頭其他規格
        weather_resistent, low_dispersion = self.compensate_lens_spec_info(self.url)
        
        self.specification = {
            "focal_length": focal_length,
            "max_aperture": max_aperture,
            "optical_stabilization": optical_stabilization,
            "weather_resistent": weather_resistent,
            "macro": macro,
            "low_dispersion": low_dispersion
        }

    
    def compensate_lens_price_info(self):
        html, status_code = send_request('https://www.nikonusa.com/en/nikon-products/camera-lenses/mirrorless-lenses/index.page')

        soup = soupify(html)
        script_list = soup.find_all("script")
        rawNikonSiteData = str(script_list[4])
        start_index = rawNikonSiteData.find("{")
        end_index = rawNikonSiteData.rfind("};")
        nikonSiteData = rawNikonSiteData[start_index:end_index+1]
        nikonSiteDataDict = json.loads(nikonSiteData)

        # 找到對應的鏡頭，並補償價格資訊
        for lens in nikonSiteDataDict['allProducts']:
            if find_matches_lens(self.name, lens['name']):
                self.price = float(lens['regularPrice'])
        

    # 用來找出鏡頭相關的資訊所在的位置，當前是在第五個 script 裡面 script_list[4]。
    def search_the_place_of_nikonSiteData(self):
        html, status_code = send_request('https://www.nikonusa.com/en/nikon-products/camera-lenses/mirrorless-lenses/index.page')
        soup = soupify(html)
        script_list = soup.find_all("script")

        for index, script in enumerate(script_list):
            print("-----------------------------------------------------")
            if ("nikonSiteData" in str(script)):
                print("found it")
                print(str(script))
                print(index)
                print("-----------------------------------------------------")
                break


# canon lens class
class canon_lens(lens):
    def get_CMOS_size(self, name):
        if (("RF-S" in name) |("EF-S" in name) | ("EF-M" in name)):
            return "aps-c"
        
        elif (("RF" in name) | ("EF" in name) | ("TS-E" in name) | ("MP-E" in name)):
            return "full frame"
        
        return 'unknown'
    

    # extract mount
    def extract_mount(self):
        match = re.match(r'^([A-Za-z-]+)', self.name)
        if match:
            self.mount = match.group(1)
        

    def import_from_dict(self, dict):
        self.name = dict['name']
        format_name = self.name.lower().replace(" ", "-").replace(".", "-").replace("/", "-")
        
        self.url = f"https://www.usa.canon.com/shop/p/{format_name}"
        self.maker = "canon"
        self.extract_mount()
        # self.image = self.get_image_url(dict['id'])
        self.price = float(dict['price'].replace(",", ""))
        self.CMOS_size = self.get_CMOS_size(self.name)
        self.extract_type()

        # 取得鏡頭規格
        focal_length = self.name.split("mm")[0].replace(self.mount, "")
        optical_stabilization = self.regex_search(r'\bIS\b', self.name)
        weather_resistent = self.regex_search(r'\bWR\b', self.name)
        macro = self.regex_search(r'\bMacro\b', self.name)
        low_dispersion = (self.regex_search(r'\bFL\b', self.name) | 
                          self.regex_search(r'\bUD\b', self.name) )
        

        # 取得鏡頭最大光圈，對 EF-M 鏡頭做特殊處理
        if self.mount == "RF" or self.mount == "RF-S":
            max_aperture = self.name.split(" ")[1].split("F")[1].split("-")[0]

        # if self.mount == "EF" or self.mount == "EF-S" or self.mount == "EF-S":
        #     max_aperture = self.name.split(" ")[2].split("-")[0].replace("f/", "").replace("L", "")

        else:
            max_aperture = self.name.split(" ")[2].split("-")[0].replace("f/", "").replace("L", "")


        self.specification = {
            "focal_length": focal_length,
            "max_aperture": max_aperture,
            "optical_stabilization": optical_stabilization,
            "weather_resistent": weather_resistent,
            "macro": macro,
            "low_dispersion": low_dispersion
        }


    # 補足鏡頭圖片資訊
    def compensate_lens_img_info(self, canon_tw_lens_list):
        for lens in canon_tw_lens_list:
            lens_soup = soupify(str(lens))
            try:
                lens_name = lens_soup.find(class_="title").text.strip()
                lens_img_url = lens_soup.find("img")["src"]
            
            except:
                continue

            if find_matches_lens(self.name, lens_name):
                self.image = lens_img_url



class sony_lens(lens):
    def get_CMOS_size(self, name):
        if "FE" in name:
            return "full frame"
        
        elif "E" in name:
            return "aps-c"
        
        return 'none'
    

    def move_characters_to_bottom(self, string):
        fe_index = string.find("FE")
        e_index = string.find("E")

        if fe_index != -1:
            prefix = string[:fe_index]
            suffix = string[fe_index:]

        elif e_index != -1:
            prefix = string[:e_index]
            suffix = string[e_index:]

        else:
            return string

        return suffix + " " + prefix
    

    def import_from_dict(self, dict):
        self.name = self.move_characters_to_bottom(dict['summary'].replace("<p>", "").replace("</p>", "")).replace("&nbsp;", "").split('Full-frame')[0].split('APS-C')[0]
        format_name = self.name.lower().replace(" ", "")
        self.url = f"https://electronics.sony.com{dict['url']}"
        self.maker = "sony"
        self.mount = self.name.split(" ")[0]
        self.image = dict["images"][0]["url"]
        self.price = float(dict['price']["value"])
        self.CMOS_size = self.get_CMOS_size(self.name)
        self.extract_type()

        # 取得鏡頭規格
        focal_length = re.sub(r"[^\d-]", "", format_name.split("mm")[0])
        try:
            max_aperture = re.sub(r"[^\d.]", "", format_name.split("mm")[1])
        except:
            max_aperture = 'none'
        
        optical_stabilization = self.regex_search(r'\bOSS\b', self.name)
        weather_resistent = True if (('G' in self.name) | ('ZEISS' in self.name)) else False
        macro = self.regex_search(r'\bMacro\b', self.name)
        low_dispersion = (self.regex_search(r'\bT\*\b', self.name))
        

        self.specification = {
            "focal_length": focal_length,
            "max_aperture": max_aperture,
            "optical_stabilization": optical_stabilization,
            "weather_resistent": weather_resistent,
            "macro": macro,
            "low_dispersion": low_dispersion
        }



# crawl fujifilm lenses
def fujifilm_crawler():
    response, status_code = send_request('https://fujifilm-x.com/global/products/x-series/#lenses')
    soup = soupify(response)

    # 取得所有定焦鏡頭資訊
    lens_html = soup.find_all("ul", {"class": "products__series_list"})[2]
    lens_soup = soupify(str(lens_html))
    lens_spec_html_list = lens_soup.find_all("li")

    # 用來存放鏡頭資訊的 list
    lens_list = []

    # 取得個別鏡頭資訊
    for lens_spec_html in lens_spec_html_list:
        lens_spec_soup = soupify(str(lens_spec_html))
        lens_info = fujifilm_lens()
        lens_info.import_from_soup(lens_spec_soup)
        lens_info.compensate_lens_info()
        lens_info.print()

        # 將鏡頭資訊加入 list
        lens_list.append(lens_info)

    return lens_list


# nikon crawler
def nikon_crawler():
    # Z mount
    response, status_code = send_request('https://imaging.nikon.com/imaging/lineup/lens/z-mount/')
    soup = soupify(response)

    # 取得所有鏡頭資訊
    lens_html = soup.find_all("div", {"class": "c-link-block__item"})

    # F mount
    response, status_code = send_request('https://imaging.nikon.com/imaging/lineup/lens/f-mount/')
    soup = soupify(response)
    lens_html2 = soup.find_all("div", {"class": "c-link-block__item"})

    lens_html.extend(lens_html2)

    # 用來存放鏡頭資訊的 list
    lens_list = []

    # 取得個別鏡頭資訊
    for lens_spec_html in lens_html:
        lens_spec_soup = soupify(str(lens_spec_html))
        lens_info = nikon_lens()
        lens_info.import_from_soup(lens_spec_soup)
        lens_info.compensate_lens_price_info()
        lens_info.print()

        # 如果是 teleconverter，就不要加入 list
        if lens_info.type == "converter":
            continue

        # 將鏡頭資訊加入 list
        lens_list.append(lens_info)

    return lens_list


def canon_crawler():
    lens_info_list = []

    # RF mount
    url = "https://www.usa.canon.com/shop/lenses/mirrorless-lenses?is_scroll=1"
    # print(url)
    response_json, status_code = send_request(url)
    lens_info_dict = json.loads(response_json)
    lens_info_list.extend(lens_info_dict["impression"])

    for i in range(2, 5):
        url = f"https://www.usa.canon.com/shop/lenses/mirrorless-lenses?p={i}&is_scroll=1"
        # print(url)
        response_json, status_code = send_request(url)
        lens_info_dict = json.loads(response_json)
        lens_info_list.extend(lens_info_dict["impression"])


    # EF mount
    url = "https://www.usa.canon.com/shop/lenses/dslr-lenses?is_scroll=1"
    response_json, status_code = send_request(url)
    lens_info_dict = json.loads(response_json)
    lens_info_list.extend(lens_info_dict["impression"])

    for i in range(2, 5):
        url = f"https://www.usa.canon.com/shop/lenses/dslr-lenses?p={i}&is_scroll=1"
        response_json, status_code = send_request(url)
        lens_info_dict = json.loads(response_json)
        lens_info_list.extend(lens_info_dict["impression"])

    # print(lens_info_list[0])

    # 取得已停產鏡頭清單
    discontinue_lens_list = []
    response, status_code = send_request("https://cweb.canon.jp/ef/lineup/old-products.html")
    soup = soupify(response)
    discontinue_lens_html_list = soup.find_all("div", {"class": "btn"})

    for discontinue_lens_html in discontinue_lens_html_list:
        discontinue_lens_soup = soupify(str(discontinue_lens_html))
        discontinue_lens_name = discontinue_lens_soup.find("a").text
        discontinue_lens_list.append(discontinue_lens_name)

    # print(discontinue_lens_list)

    # 用來存放鏡頭資訊的 list
    lens_list = []


    # 補足鏡頭圖片資訊
    def get_img_url_from_canon_tw():
        # RF
        html, status_code = send_request('https://tw.canon/zh_TW/consumer/products/search?category=photography&subCategory=rf-lenses&max=120')
        soup = soupify(html)
        canon_tw_lens_list = soup.find_all(class_="col-xs-12")
        
        # EF
        html, status_code = send_request('https://tw.canon/zh_TW/consumer/products/search?category=photography&subCategory=ef-lenses&max=120')
        soup = soupify(html)
        canon_tw_lens_list.extend(soup.find_all(class_="col-xs-12"))

        # EF-M
        html, status_code = send_request('https://tw.canon/zh_TW/consumer/products/search?category=photography&subCategory=ef-m-lenses')
        soup = soupify(html)
        canon_tw_lens_list.extend(soup.find_all(class_="col-xs-12"))

        return canon_tw_lens_list

    
    # 取得個別鏡頭資訊
    canon_tw_lens_list = get_img_url_from_canon_tw()
    for lens_spec_dict in lens_info_list:
        lens_info = canon_lens()
        lens_info.import_from_dict(lens_spec_dict)
        lens_info.compensate_lens_img_info(canon_tw_lens_list)
        lens_info.print()

        # 如果是 teleconverter，就不要加入 list
        if lens_info.type == "converter" or lens_info.type == "kit":
            continue
        
        # 移除已停產的鏡頭
        # is_discontinue = False
        # for discontinue_lens_name in discontinue_lens_list:
        #     if discontinue_lens_name.lower().replace(" ", "") == lens_info.name.lower().replace("/", "").replace(" ", ""):
        #         print("-----------------------------------------")
        #         print(f"{discontinue_lens_name} is discontinue!")
        #         print("-----------------------------------------")
        #         is_discontinue = True
        #         continue

        # 將鏡頭資訊加入 list
        # if not is_discontinue:
        lens_list.append(lens_info)

    return lens_list


# crawl sony lenses
def sony_crawler():
    lens_info_list = []
    response, status_code = send_request("https://api.electronics.sony.com/occ/v2/sna/products/search?fields=keywordRedirectUrl%2CseoTitle%2CenableCompare%2CseoDescription%2Ccategories(FULL)%2CgwCategories(FULL)%2Cbaseproduct(code%2Cname%2Cvariants%2Cproducts(preOrder%2CrewardsInfo%2CproductBadges%2CproductType%2Ccode%2Curl%2Cname%2Csummary%2Cprice(FULL)%2CoriginalPrice(FULL)%2Cimages(FULL)%2Cstock(FULL)%2Ccategories(FULL)%2CgwCategories(FULL)%2CgwSupermodel%2CgwSku%2CgwModel%2CmodelName%2CsuperModelName%2CglobalModelName%2CaverageRating%2Cbadge%2CnotifyMe%2CbadgeType%2CnotifyMe))%2Cfacets(CUSTOM)%2Cbreadcrumbs%2Cpagination(DEFAULT)%2Csorts(DEFAULT)%2CfreeTextSearch%2CcurrentQuery%2CcontentTiles&query=%3Arelevance%3AsnaAllCategories%3Aall-e-mount&pageSize=300&lang=en&curr=USD")

    lens_info_dict = json.loads(response)
    lens_info_list.extend(lens_info_dict["baseproduct"])

    # 用來存放鏡頭資訊的 list
    lens_list = []

    # 取得個個別鏡頭資訊
    for lens_spec_dict in lens_info_list:
        lens_spec_dict = lens_spec_dict["products"][0]

        lens_info = sony_lens()
        lens_info.import_from_dict(lens_spec_dict)
        lens_info.print()

        if lens_info.type == 'zoom' or lens_info.type == 'prime':
            lens_list.append(lens_info)

    return lens_list



def gather_lens(crawler, is_new=True, reset=False):
    lens_list = crawler()

    if reset:
        is_sucess = delete_from_database(lens_list)

    # 沒出現在資料庫的鏡頭，就加入資料庫
    if is_new:
        is_sucess = write_to_database(lens_list)

    # 出現在資料庫的鏡頭，就更新資料庫
    else:
        is_sucess = update_to_database(lens_list)

    # is_sucess = auto_to_database(lens_list)
    
    if is_sucess:
        print("------------------------------------")
        print("Success!")

    else:
        print("------------------------------------")
        print("Fail!")



def main():
    # gather_lens(fujifilm_crawler, is_new = False)
    # gather_lens(nikon_crawler, is_new = False)
    gather_lens(canon_crawler, is_new = False)
    # gather_lens(sony_crawler, is_new = False)
    print()


# fujifilm_crawler()
# nikon_crawler()
# canon_crawler()
# sony_crawler()
main()


# html, status_code = send_request('https://tw.canon/zh_TW/consumer/products/search?category=photography&subCategory=ef-lenses&max=120')
# soup = soupify(html)
# print(soup)
# canon_jp_lens_list = soup.find_all(class_="col-xs-12")





# response, status_code = send_request("https://api.electronics.sony.com/occ/v2/sna/products/search?fields=keywordRedirectUrl%2CseoTitle%2CenableCompare%2CseoDescription%2Ccategories(FULL)%2CgwCategories(FULL)%2Cbaseproduct(code%2Cname%2Cvariants%2Cproducts(preOrder%2CrewardsInfo%2CproductBadges%2CproductType%2Ccode%2Curl%2Cname%2Csummary%2Cprice(FULL)%2CoriginalPrice(FULL)%2Cimages(FULL)%2Cstock(FULL)%2Ccategories(FULL)%2CgwCategories(FULL)%2CgwSupermodel%2CgwSku%2CgwModel%2CmodelName%2CsuperModelName%2CglobalModelName%2CaverageRating%2Cbadge%2CnotifyMe%2CbadgeType%2CnotifyMe))%2Cfacets(CUSTOM)%2Cbreadcrumbs%2Cpagination(DEFAULT)%2Csorts(DEFAULT)%2CfreeTextSearch%2CcurrentQuery%2CcontentTiles&query=%3Arelevance%3AsnaAllCategories%3Aall-e-mount&pageSize=300&lang=en&curr=USD")

# lens_info_dict = json.loads(response)
# lens_info_list = lens_info_dict["baseproduct"]

# for lens_info in lens_info_list:
#     print(lens_info['name'])





# quick_peek('https://fujifilm-x.com/global/products/lenses')
# https://www.usa.canon.com/shop/lenses/mirrorless-lenses?p=2&is_scroll=1





#  https://s7d1.scene7.com/is/image/canon/5554C002_rf52mm-f28-l-dual-fisheye_primary?fmt=webp-alpha&wid=280

# response, status_code = send_request('https://s7d1.scene7.com/is/image/canon/5051C002_rf16mm-f2.8-stm_primary?wid=256')
# print(status_code)


# for lens_info in lens_info_list:
#     print(lens_info["name"])


# RF800mm F5.6 L IS USM
