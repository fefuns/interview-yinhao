import React, { useState, useRef } from "react";
import Loading from 'components/Loading';
import { isQQ } from 'utils/validate';
import { getQqInfo } from "api/qq";
import { debounce } from 'lodash';
import "./App.scss";

interface IQqInfo {
  qlogo?: string;
  name?: string;
  qq?: string;
}
function App() {
  // qq号
  const [qq, setQq] = useState('');
  // 校验qq号是否合法，如不合法，则提示对应错误信息
  const [validateError, setValidateError] = useState('');
  // qq信息
  const [qqInfo, setQqInfo] = useState<IQqInfo>({});
  // 接口是否加载中
  const [loading, setLoading] = useState(false);
  // 后端接口错误信息
  const [resError, setResError] = useState('');
  // 延迟获取QQ信息
  const delayGetQQInfo = useRef(
    debounce((qq: string) => getQQInfo(qq), 500)
  ).current;
  // 获取QQ信息
  async function getQQInfo(qq: string) {
    setQqInfo({});
    setValidateError('');
    setResError('');
    if (qq) {
      if (!isQQ(qq)) {
        setValidateError('请输入正确格式的QQ号码');
        return;
      }
      setLoading(true);
      const res: any = await getQqInfo({ qq });
      setLoading(false);
      if (res.code === 1) {
        setQqInfo(res)
      } else {
        setResError(res.msg)
      }
    }
  }
  // input chagne事件
  function changeQQ(e: React.ChangeEvent<HTMLInputElement>) {
    setQq(e.target.value)
    delayGetQQInfo(e.target.value)
  }
  return <div className="App">
    <div className="qq-search-wrap">
      <h1 className="search-title">QQ号查询</h1>
      <div className="search-hd">
        <label className="fm-label">QQ</label>
        <div className="fm-child">
          <input type="text" minLength={5} maxLength={10} className="fm-input" onChange={changeQQ} value={qq} placeholder="请输入5~10位的QQ号码"/>
          <p className="fm-tips">{validateError}</p>
        </div>
      </div>
      <div className="search-bd">
        {/* 加载中 */}
        {loading && <Loading />}
        {/* 加载失败 */}
        {resError && <p className="error">{resError}</p>}
        {/* 加载成功 */}
        {qqInfo.qq && <div className="qq-info">
          <img src={qqInfo.qlogo} alt={qqInfo.name} className="avatar" />
          <div className="info">
            <h4 className="name" title={qqInfo.name}>{qqInfo.name}</h4>
            <p className="qq" title={qqInfo.qq}>{qqInfo.qq}</p>
          </div>
        </div>}
      </div>
    </div>

  </div>;
}

export default App;
