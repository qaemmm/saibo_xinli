from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from lunar_python import Solar


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

WUXING_MAP: Dict[str, str] = {
    "甲": "木",
    "乙": "木",
    "丙": "火",
    "丁": "火",
    "戊": "土",
    "己": "土",
    "庚": "金",
    "辛": "金",
    "壬": "水",
    "癸": "水",
    "寅": "木",
    "卯": "木",
    "巳": "火",
    "午": "火",
    "辰": "土",
    "丑": "土",
    "戌": "土",
    "未": "土",
    "申": "金",
    "酉": "金",
    "子": "水",
    "亥": "水",
}


class BaziRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    gender: str
    time_unknown: bool = False


class BaziResponse(BaseModel):
    year: str
    month: str
    day: str
    hour: str
    gender: str
    wuxing: Dict[str, int]
    rizhu: str
    xiyongshen: str


def calculate_xiyongshen(wuxing: Dict[str, int], rizhu: str) -> str:
    rizhu_element = WUXING_MAP.get(rizhu, "")
    min_element = ""
    min_count = 999
    for element, count in wuxing.items():
        if count < min_count:
            min_count = count
            min_element = element
    if rizhu_element and wuxing.get(rizhu_element, 0) <= 2:
        return rizhu_element
    return min_element


@app.post("/bazi", response_model=BaziResponse)
def calculate_bazi(payload: BaziRequest) -> BaziResponse:
    try:
        hour = 12 if payload.time_unknown else payload.hour
        solar = Solar.fromYmdHms(payload.year, payload.month, payload.day, hour, 0, 0)
        lunar = solar.getLunar()
        eight_char = lunar.getEightChar()

        year_pillar = str(eight_char.getYear())
        month_pillar = str(eight_char.getMonth())
        day_pillar = str(eight_char.getDay())
        hour_pillar = str(eight_char.getTime())

        wuxing: Dict[str, int] = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}
        for pillar in [year_pillar, month_pillar, day_pillar, hour_pillar]:
            for char in pillar:
                element = WUXING_MAP.get(char)
                if element:
                    wuxing[element] += 1

        rizhu = day_pillar[0] if day_pillar else ""
        xiyongshen = calculate_xiyongshen(wuxing, rizhu)

        return BaziResponse(
            year=year_pillar,
            month=month_pillar,
            day=day_pillar,
            hour=hour_pillar,
            gender=payload.gender,
            wuxing=wuxing,
            rizhu=rizhu,
            xiyongshen=xiyongshen,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
