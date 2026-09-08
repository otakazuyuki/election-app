import {useState} from "react";

export const TopPage = () => {
    const [prefecture, setPrefecture]=useState<string>("");
    const [city, setCity]=useState<string>("");
    const [detailcity, setDetailcity]=useState<string>("");

    const prefectureList=[
        "北海道",
        "青森県",
        "岩手県",
        "宮城県",
        "秋田県",
        "山形県",
        "福島県"
    ];

    return(
        <div>
            <select value={prefecture} onChange={(e)=>setPrefecture(e.target.value)}>
                <option value="">都道府県を選択</option>
                {prefectureList.map((pref)=>(
                    <option key={pref} value={pref}>
                        {pref}
                    </option>
                ))}
            </select>
        </div>
    )
}