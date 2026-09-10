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
    const [town, setTown] = useState<string>("");             // 選択された詳細市区町村名


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

                console.log("読み込んだ districtsData:", districtsData);

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

    if(loading){
        return <div>データ読み込み中...</div>
    }

    /*データ整理*/

    // 都道府県のリストを作成（重複を排除）
    const prefectureList=Array.from(new Set(districts.map((d) => d.prefecture)));

    //市区町村のリストを作成（都道府県ごとにグループ化）
    const cityList = prefecture
        ? Array.from(new Set(districts.filter((d) => d.prefecture === prefecture).map((d) => d.city)))
        : [];

    //詳細市区町村のリストを作成（市区町村ごとにグループ化）
    const townList = prefecture && city
    ? Array.from(new Set(
        districts
            .filter((d) => d.prefecture === prefecture && d.city === city && d.town)
            .map((d) => d.town!)
    ))
    : [];

    /*住所に一致する区割り情報の特定*/
    const selectedLocation = districts.find((d) => {
        if (d.prefecture !== prefecture || d.city !== city) return false;
        if (townList.length > 0) return d.town === town;
        return true;
    });
    const myDistrictIds = selectedLocation ? Object.values(selectedLocation.districts) : [];

    /*選挙情報の抽出*/
    const activeElections = Object.values(elections).flatMap((event) => {
        const matchedRaceKeys = Object.keys(event.races).filter((id) => myDistrictIds.includes(id));

        return matchedRaceKeys.map((districtId) => ({
            eventTitle: event.title,
            voteDate: event.voteDate,
            race: event.races[districtId],
        }))
    })

    // レンタリング
    return (
        <div style={{display:"flex", flexDirection:"column",gap:"16px", padding:"20px"}}>
            {/*選択状況表示バー*/}
            <div>
                <strong>選択地域：</strong>
                {prefecture || "都道府県を選択"}
                {city && ` > ${city}`}
                {town && ` > ${town}`}

                {prefecture && (
                    <button onClick={() => { setPrefecture(""); setCity(""); setTown("");}}
                        style={{marginLeft:"12px"}}
                    >
                        リセット
                    </button>
                )}
            </div>

            {/*都道府県選択*/}
            {!prefecture && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {prefectureList.map((p) => (
                        <button key={p} onClick={() => setPrefecture(p)}>{p}</button>
                    ))}
                </div>
            )}

            {/*市区町村選択*/}
            {prefecture && !city && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {cityList.map((c) => (
                        <button key={c} onClick={() => setCity(c)}>{c}</button>
                    ))}
                </div>
            )}

            {/*詳細市区町村選択*/}
            {prefecture && city && townList.length > 0 && !town && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {townList.map((t) => (
                        <button key={t} onClick={() => setTown(t)}>{t}</button>
                    ))}
                </div>
            )}

            {/*選挙情報と候補者情報を表示*/}
            {selectedLocation && (townList.length === 0 || town) && (
                <div style={{display:"flex", flexDirection:"column", gap:"16px", marginTop:"16px"}}>
                    <h3>該当する選挙情報({activeElections.length}件)</h3>

                    {activeElections.length === 0 ? (
                        <p>予定されている選挙情報はありません。</p>

                    ) : (
                        activeElections.map((item, index) => (
                            <div
                                key={index}
                                style={{border:"1px solid #ccc", padding:"12px", borderRadius:"8px"}}
                            >
                                <h3>{item.eventTitle}</h3>
                                <div style={{fontSize:"14px", color:"#666"}}>投票日：{item.voteDate}</div>
                                <h4 style={{ margin: "4px 0 12px 0" }}>{item.race.districtName}</h4>

                                <div>
                                    <strong>候補者：</strong>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                                        {item.race.candidacies.map((cand: Candidacy) => {
                                            const person: Person | undefined = people[cand.personId];

                                            return (
                                                <div
                                                    key={cand.personId}
                                                    style={{ border: "1px solid #eee", padding: "8px", borderRadius: "4px", backgroundColor: "#fff" }}
                                                >
                                                    {person ? (
                                                        <div>
                                                            <span><strong>{person.name}</strong>({person.party})</span>
                                                            {cand.isIncumbent && <span style={{color: "red", marginLeft: "8px"}}>現職</span>}
                                                            {cand.status && <span style={{ marginLeft: "8px", color: "#0066cc" }}>[{cand.status}]</span>}
                                                        </div>
                                                    ) : (
                                                        <div>候補者ID：{cand.personId}(詳細情報なし)</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                        ))
                    )}
                </div>
            )}
        </div>

    );
};