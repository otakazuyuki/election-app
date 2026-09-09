import { useState,useEffect} from "react";
import type {
    PeopleMap,
    DistrictsData,
    ElectionMap,
    Person,
    Candidacy
} from "../types/election";

//トップページ
export const TopPage = () => {
    //データのState
    const [people, setPeople] = useState<PeopleMap>({});
    const [districts, setDistricts] = useState<DistrictsData>([]);
    const [elections, setElections] = useState<ElectionMap>({});
    const [loading, setLoading] = useState<boolean>(true);

    //UIにまつわるState
    const [prefecture, setPrefecture] = useState<string>(""); // 選択された都道府県名
    const [city, setCity] = useState<string>("");             // 選択された市区町村名
    const [detailcity, setDetailcity] = useState<string>(""); // 選択された詳細市区町村名

    //データ
    const prefectureList = [
        "北海道",
        "青森県",
        "岩手県",
        "宮城県",
        "秋田県",
        "山形県",
        "福島県"
    ];

    // 都道府県名をキーとする市区町村リストのマップデータ
    const cityList: Record<string, string[]> = {
        "北海道": ["札幌市", "函館市", "小樽市"],
        "青森県": ["青森市", "弘前市", "八戸市"],
        "岩手県": ["盛岡市", "宮古市", "大船渡市"],
        "宮城県": ["仙台市", "石巻市", "塩竈市"],
        "秋田県": ["秋田市", "横手市", "大館市"],
        "山形県": ["山形市", "米沢市", "鶴岡市"],
        "福島県": ["福島市", "郡山市", "いわき市"]
    };

    // 市区町村名をキーとする詳細市区町村リストのマップデータ
    const detailCityList: Record<string, string[]> = {
        "札幌市": ["中央区", "北区", "東区"],
        "仙台市": ["青葉区", "宮城野区", "若林区", "太白区", "泉区"],
    };

    //詳細地域データが存在するか判定する
    const hasDetailCity=Boolean(detailCityList[city]?.length);

    //3つのJSONデータを非同期で読み込む
    useEffect(() => {
        const fetchAllData=async () => {
            try{
                const [peopleRes,districtsRes, electionRes]=await Promise.all([
                    fetch("/data/people.json"),
                    fetch("/data/districts.json"),
                    fetch("/data/elections.json")
                ]);

                if(!peopleRes.ok || !districtsRes.ok || !electionRes.ok){
                    throw new Error("データの取得に失敗しました");
                }

                const peopleData=await peopleRes.json();
                const districtsData=await districtsRes.json();
                const electionsData=await electionRes.json();

                setPeople(peopleData);
                setDistricts(districtsData);
                setElections(electionsData);
            } catch (error) {
                console.error("データの取得中にエラーが発生しました:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // レンタリング
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* ヘッダー：現在の選択状況表示*/}
            <div>
                都道府県：
                {prefecture ? (
                    /* 選択済みの場合：クリックでリセットできるバツ付きボタンを表示 */
                    <button onClick={() => {
                        setPrefecture("");
                        setCity("");
                        setDetailcity("");
                    }}>
                        {prefecture} ✕
                    </button>
                ) : (
                    "未選択"
                )}
                {city && (
                    <button onClick={() => {
                        setCity("");
                        setDetailcity("");
                    }}>
                        {city} ✕
                    </button>
                )}
                {detailcity && (
                    <button onClick={() => setDetailcity("")}>
                        {detailcity} ✕
                    </button>
                )}
            </div>

            {/*都道府県の選択ボタン一覧（未選択時のみ表示） */}
            {!prefecture && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {prefectureList.map((pref) => (
                        <button key={pref} onClick={() => setPrefecture(pref)}>
                            {pref}
                        </button>
                    ))}
                </div>
            )}

            {/*選択された都道府県に紐づく市区町村の選択ボタン一覧 */}
            {prefecture && !city && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {/* オプショナルチェイニング(?.)で未定義エラーを防止 */}
                    {cityList[prefecture]?.map((c) => (
                        <button key={c} onClick={() => setCity(c)}>
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {/*選択された市区町村に紐づく詳細市区町村の選択ボタン一覧 */}
            {city && !detailcity && (
                <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                    {detailCityList[city]?.map((dc) => (
                        <button key={dc} onClick={() => setDetailcity(dc)}>
                            {dc}
                        </button>
                    ))}
                </div>
            )}

            {/*最終決定後の選挙情報表示エリア */}
            {prefecture && city && (detailcity || !hasDetailCity) && (
                <div style={{ padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}>
                    <h3>{prefecture} {city} {detailcity} の選挙情報</h3>
                    <p>ここに該当する小選挙区や近日の選挙情報を表示します。</p>
                </div>
            )}
        </div>
    );
};