const Container = PIXI.Container,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle;

const defaultRoadTdWidth = 100,
    defaultPadding = (defaultRoadTdWidth - 85) / 2,
    defaultRoadTdHeight = 100;

const casionTable = new Map();

const roadChildArray = [
    ["banker.png", "player.png", "tie.png"],
    ["bigRed.png", "bigBlue.png"],
    ["bigRed.png", "bigBlue.png"],
    ["smallRed.png", "smallBlue.png"],
    ["cockroachRed.png", "cockroachBlue.png"],
    ["tie1.png", "tie2.png", "tie3.png", "tie4.png", "tie5.png", "tie6.png", "tie7.png", "tie8.png", "tie9.png"],
    ["bankerPairB.png", "bankerPairP.png", "bankerPairBP.png", "playerPairB.png", "playerPairP.png", "playerPairBP.png", "tiePairB.png", "tiePairP.png", "tiePairBP.png"],
    ["bigRedPairB.png", "bigRedPairP.png", "bigRedPairBP.png", "bigBluePairB.png", "bigBluePairP.png", "bigBluePairBP.png"]
];

class Road {
    constructor(app) {
        this.app = app;
        this.resultArray = new Array();//结果集
        this.resultCount = 0;//总盘数
        this.bankerResultCount = 0;//开庄总数
        this.playerResultCount = 0;//开闲总数
        this.tieResultCount = 0;//开和总数
        this.bankerPairCount = 0;//庄一对总数
        this.playerPairCount = 0;//闲一对总数
        this.markerRoad = new Array();//珠盘路
        this.bigRoad = new Array();// 大路
        this.bigEyeRoad = new Array();//大眼路
        this.smallRoad = new Array();//小路
        this.cockroachRoad = new Array();//曱甴路
        this.bigRoadLastRow = -1;//大路最后绘画的行,最大为5（6）大于5时需要转列（或下方位被占用时）。
        this.bigRoadLastCol = -1;// 大路最后绘画的列
        this.bigRoadLastColTurn = -1;//大路转弯列
        this.bigRoadLastMarker = -1;//大路最后绘画的结果（非和）
        this.bigRoadLastTieCount = 0;//大路最后绘画的结果为和的数量
        this.bigRoadFirstTieCount = 0;//大路开始时为和的数量
        this.startBigEyeRoad = false;// – 曱甴路：大路第四列的第一手牌之后
        this.bigEyeRoadLastRow = 0;//大眼路最后绘画的行
        this.bigEyeRoadLastCol = 0;//大眼路最后绘画的列
        this.bigEyeRoadBeforeIsNull = false;
        this.bigEyeRoadLastColTurn = -1;//大眼路转弯列
        this.startSmallRoad = false;//开始画小路
        this.smallRoadLastRow = 0;//小路最后绘画的行
        this.smallRoadLastCol = 0;//小路最后绘画的列
        this.smallRoadBeforeIsNull = false;
        this.smallRoadLastColTurn = -1;//小路转弯列
        this.startCockroachRoad = false;// 开始画曱甴路
        this.cockroachRoadLastRow = 0;//曱甴路最后绘画的行
        this.cockroachRoadLastCol = 0;//曱甴路最后绘画的列
        this.cockroachRoadBeforeIsNull = false;
        this.cockroachRoadLastColTurn = -1;// 曱甴路转弯列
        if (roadMaxCol >= 25) {
            this.markerRoadMaxCol = 11;
            this.cockroachRoadStartY = 17.5;
        } else {
            this.markerRoadMaxCol = 6;
            this.cockroachRoadStartY = 9.5;
        }
        this.bigRoadMaxCol = (roadMaxCol - this.markerRoadMaxCol) / this.getScaleByType(1) - 1;
        this.markerChildArray = new Array();
        this.bigChildArray = new Array();
        this.bigRoadMaxX = 0;
        //this.generateBigRoad();
    }

    // Getter
    get getResultCount() {
        return this.resultCount;
    }

    get getBankerResultCount() {
        return this.bankerResultCount;
    }

    get getPlayerResultCount() {
        return this.playerResultCount;
    }

    get getTieResultCount() {
        return this.tieResultCount;
    }

    get getBankerPairCount() {
        return this.bankerPairCount;
    }

    get getPlayerPairCount() {
        return this.playerPairCount;
    }


    get getResultArray() {
        return this.resultArray;
    }

    get getMarkerRoad() {
        return this.markerRoad;
    }

    get getBigRoad() {
        return this.bigRoad;
    }

    get getBigEyeRoad() {
        return this.bigEyeRoad;
    }

    get getSmallRoad() {
        return this.smallRoad;
    }

    get getCockroachRoad() {
        return this.cockroachRoad;
    }


    //添加路纸背景
    addRoadBackground() {
        //draw background line
        let lineColor = 0x000000;

        for (let col = 0; col <= 6; col++) {
            let line = new PIXI.Graphics();
            let y = col * defaultRoadTdHeight;
            line.lineStyle(1, lineColor, 0.1);
            line.moveTo(0, y);
            line.lineTo(defaultRoadWidth, y);
            line.x = 0;
            line.y = 0;
            this.app.stage.addChild(line);
        }
        for (let col = 1; col <= 6; col++) {
            let line = new PIXI.Graphics();
            let y = (col - 0.5) * defaultRoadTdHeight;
            line.lineStyle(1, lineColor, 0.1);
            line.moveTo(this.markerRoadMaxCol * defaultRoadTdWidth, y);
            line.lineTo(defaultRoadWidth, y);
            line.x = 0;
            line.y = 0;
            this.app.stage.addChild(line);
        }
        for (let row = 0; row <= roadMaxCol; row++) {
            let line = new PIXI.Graphics();
            let x = row * defaultRoadTdWidth;
            line.lineStyle(1, lineColor, 0.1);
            line.moveTo(x, 0);
            line.lineTo(x, defaultRoadHeight);
            line.x = 0;
            line.y = 0;
            this.app.stage.addChild(line);
        }

        for (let row = 1; row <= roadMaxCol; row++) {
            let line = new PIXI.Graphics();
            let x = (row - 0.5) * defaultRoadTdWidth + this.markerRoadMaxCol * defaultRoadTdWidth;
            line.lineStyle(1, lineColor, 0.1);
            line.moveTo(x, 0);
            line.lineTo(x, defaultRoadHeight);
            line.x = 0;
            line.y = 0;
            this.app.stage.addChild(line);
        }
    }

    //计算x
    getDrawX(roadType, oldX) {
        let x = oldX;
        switch (roadType) {
            case 0:

                break;
            case 1:
            case 5:
                //大路缩小2倍
                // console.info("--- x = "+x+" , bigRoadMaxCol = "+this.bigRoadMaxCol+" , bigRoadLastCol = "+this.bigRoadLastCol);
                // if (x >= this.bigRoadMaxCol) {
                //     //超出的都画在最后一列
                //     x = this.bigRoadMaxCol - 1;
                // }

                break;
            case 2:
            case 3:
            case 4:
                //大眼路，小路，曱甴路缩小4倍
                // scale = scale / 4;
                break;
        }
        return x;
    }

    addRoadChildDetail(roadType, startX, startY, x, y, result) {
        let scale = this.getScaleByType(roadType);
        let padding = defaultPadding * scale;
        let childX = startX + padding + x * defaultRoadTdWidth * scale;
        let childY = startY + padding + y * defaultRoadTdHeight * scale;
        let child = this.createRoadChild(roadType, result);
        child.x = childX;
        child.y = childY;

        if (roadType === 0) {
            // console.info("childX = "+childX+" , x = "+x+" , this.markerRoadMaxCol ="+this.markerRoadMaxCol);
            this.markerChildArray.push(child);
            if (x >= this.markerRoadMaxCol) {
                //超出了要画在最后一列

                child.x -=defaultRoadTdWidth * scale;
            }
        } else if (roadType === 1) {
            if (this.bigChildArray[x] === undefined) {
                this.bigChildArray[x] = [];
            }
            this.bigChildArray[x].push(child);
            if(x > this.bigRoadMaxX){
                this.bigRoadMaxX = x;
            }
            if (this.bigRoadLastCol >= this.bigRoadMaxCol) {
                let moveCount = 0;
                if(this.bigRoadLastCol != this.bigRoadMaxCol){ //向前调整
                    moveCount = this.bigRoadMaxX - this.bigRoadLastCol;
                }
                child.x -= (defaultRoadTdWidth * scale * (x - this.bigRoadMaxCol + 1 + moveCount));
            }

        }
        this.app.stage.addChild(child);
    }

    getScaleByType(roadType) {
        let scale = 1;
        switch (roadType) {
            case 1:
            case 5:
                //大路缩小2倍
                scale = scale / 2;
                break;
            case 2:
            case 3:
            case 4:
                //大眼路，小路，曱甴路缩小4倍
                scale = scale / 4;
                break;
        }
        return scale;
    }

    createRoadChild(roadType, result) {
        let imgName = roadChildArray[roadType][result - 1];
        let texture = TextureCache[imgName];
        let sprite = new Sprite(texture);
        let scale = this.getScaleByType(roadType);
        sprite.scale.x = scale;
        sprite.scale.y = scale;
        return sprite;
    }


    //添加路纸精灵
    addRoadChild(stageIndex, addResult) {
        if (addResult[0] !== -1) {
            //Marker Road
            let startX = 0;
            let startY = 0;
            this.addRoadChildDetail(0, startX, startY, addResult[0], addResult[1], addResult[2]);
        }
        if (addResult[3] !== -1) {
            //Big Road
            let startX = defaultRoadTdWidth * this.markerRoadMaxCol;
            let startY = 0;
            this.addRoadChildDetail(1, startX, startY, addResult[3], addResult[4], addResult[5]);
            let tieCount = parseInt(addResult[5] / 10);
            if (tieCount >= 1) {
                this.addRoadChildDetail(5, startX, startY, addResult[3], addResult[4], tieCount);
            }
        }
        if (addResult[6] !== -1) {
            //Big Eye Road
            let startX = defaultRoadTdWidth * this.markerRoadMaxCol;
            let startY = defaultRoadTdHeight * 3;
            this.addRoadChildDetail(2, startX, startY, addResult[6], addResult[7], addResult[8]);
        }
        if (addResult[9] !== -1) {
            let startX = defaultRoadTdWidth * this.markerRoadMaxCol;
            let startY = defaultRoadTdHeight * 4.5;
            this.addRoadChildDetail(3, startX, startY, addResult[9], addResult[10], addResult[11]);
        }

        if (addResult[12] !== -1) {
            //17.5
            let startX = defaultRoadTdWidth * this.cockroachRoadStartY;
            let startY = defaultRoadTdHeight * 4.5;
            this.addRoadChildDetail(4, startX, startY, addResult[12], addResult[13], addResult[14]);
        }
        //console.log(addResult);
    }

    /**
     * 新增珠盘路
     *
     * @param newMarker
     *            1=庄，2=闲，3=和
     */
    addMarkerRoad(newMarker) {
        this.resultCount++;
        switch (newMarker) {
            case 1:
                this.bankerResultCount++;
                break;
            case 2:
                this.playerResultCount++;
                break;
            case 3:
                this.tieResultCount++;
                break;
        }
        let drawCol = parseInt(this.resultArray.length / 6);
        let drawRow = this.resultArray.length % 6;
        if (this.markerRoad[drawCol] === undefined) {
            this.markerRoad[drawCol] = [0, 0, 0, 0, 0, 0];
            if (drawCol >= this.markerRoadMaxCol) {
                //处理画的珠盘路超出问题
                // console.info("drawCol = " + drawCol);
                for (let i = (drawCol - 6) * 6; i < this.markerChildArray.length; i++) {
                    if (i < (drawCol - 6) * 6 + 6) {
                        this.app.stage.removeChild(this.markerChildArray[i]);
                    } else {
                        this.markerChildArray[i].x -= defaultRoadTdWidth;
                    }
                }
            }
        }
        this.resultArray.push(newMarker);

        this.markerRoad[drawCol][drawRow] = newMarker;
        let addResult = [drawCol, drawRow, newMarker];
        let bigRoadResult = this.addBigRoad(newMarker);
        Array.prototype.push.apply(addResult, bigRoadResult);
        return addResult;
    }

    /**
     * 新增大路
     *
     * @param newMarker
     *            1=庄，2=闲，3=和
     */
    addBigRoad(newMarker) {
        if (this.bigRoadLastCol === -1 && newMarker === 3) {
            this.bigRoadFirstTieCount++;
        } else {
            if (this.bigRoadLastCol === -1) {
                // 第一盘非和
                this.bigRoadLastCol = 0;
                this.bigRoadLastRow = 0;
                this.bigRoadLastMarker = newMarker;
                this.bigRoadLastTieCount = 0;
            } else {
                if (newMarker === 3) {
                    this.bigRoadLastTieCount++;
                } else {
                    this.bigRoadLastTieCount = 0;

                    if (this.bigRoadLastMarker === newMarker) {
                        // 连庄，连闲
                        if (this.bigRoadLastColTurn >= 0) {
                            // 转弯
                            // 继续向同一方向画
                            this.bigRoadLastColTurn++;
                        } else if (this.bigRoadLastRow < 5
                            && this.bigRoad[this.bigRoadLastCol][this.bigRoadLastRow + 1] === 0) {
                            // 下方有空位
                            this.bigRoadLastRow++;
                        } else {
                            // 首次转弯
                            this.bigRoadLastColTurn = this.bigRoadLastCol;
                            this.bigRoadLastColTurn++;
                        }
                    } else {
                        // 庄闲交错分布
                        this.bigRoadLastCol++;
                        this.bigRoadLastColTurn = -1;
                        this.bigRoadLastRow = 0;
                        this.bigRoadLastMarker = newMarker;
                    }
                }
            }
            let drawCol = this.bigRoadLastCol;
            let drawRow = this.bigRoadLastRow;
            let drawResult = this.bigRoadLastMarker + (this.bigRoadLastTieCount * 10);
            if (this.bigRoadFirstTieCount > 0 && drawCol === 0 && drawRow === 0) {
                drawResult = this.bigRoadLastMarker + (this.bigRoadFirstTieCount * 10);
                this.bigRoadFirstTieCount = 0;
            }
            if (this.bigRoadLastColTurn >= 0) {
                drawCol = this.bigRoadLastColTurn;
            }

            if (this.bigRoad[drawCol] === undefined) {
                this.bigRoad[drawCol] = [0, 0, 0, 0, 0, 0];

                let scale = this.getScaleByType(1);
                if (drawCol >= this.bigRoadMaxCol) {
                    for (let i = (drawCol - this.bigRoadMaxCol); i < this.bigChildArray.length; i++) {
                        for (let j = 0; j < this.bigChildArray[i].length; j++) {
                            if (i == (drawCol - this.bigRoadMaxCol)) { //最前列要removeChild
                                this.app.stage.removeChild(this.bigChildArray[i][j]);
                            } else {
                                this.bigChildArray[i][j].x -= (defaultRoadTdWidth * scale);
                            }
                        }
                    }
                }
            }
            this.bigRoad[drawCol][drawRow] = drawResult;
            let bigEyeRoadResult = this.addBigEyeRoad(newMarker); // 画大眼路
            let smallRoadResult = this.addSmallRoad(newMarker);// 画小路
            let cockroachRoadResult = this.addCockroachRoad(newMarker);// 画曱甴路
            //return [drawCol, drawRow, drawResult];
            let addResult = [drawCol, drawRow, drawResult];
            Array.prototype.push.apply(addResult, bigEyeRoadResult);
            Array.prototype.push.apply(addResult, smallRoadResult);
            Array.prototype.push.apply(addResult, cockroachRoadResult);
            return addResult;
            // return  [drawCol, drawRow, drawResult, bigEyeRoadResult[0],
            //     bigEyeRoadResult[1], bigEyeRoadResult[2], smallRoadResult[0],
            //     smallRoadResult[1], smallRoadResult[2], cockroachRoadResult[0],
            //     cockroachRoadResult[1], cockroachRoadResult[2]];
        }
        return [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    }

    /**
     * 添加大眼路
     * @param newMarker  1=庄，2=闲，3=和
     * @return
     */
    addBigEyeRoad(newMarker) {
        if (newMarker === 3) {// 为和时不画
            return [-1, -1, -1];
        }
        let roadType = 2;
        if (this._isStart(roadType)) {
            let result = 0; // 1=红，2=蓝
            if (this.bigRoadLastRow === 0) {
                this.bigEyeRoadBeforeIsNull = false;
                result = this._isNeatResult(roadType);
            } else {
                result = this._towAndOtherResult(roadType);

            }
            let drawIndexResult = this._getDrawIndex(roadType, result);

            if (this.bigEyeRoad[drawIndexResult[0]] === undefined) {
                this.bigEyeRoad[drawIndexResult[0]] = [0, 0, 0, 0, 0, 0];
            }
            this.bigEyeRoad[drawIndexResult[0]][drawIndexResult[1]] = result;
            this.bigEyeRoadLastCol = drawIndexResult[2];
            this.bigEyeRoadLastRow = drawIndexResult[3];
            this.bigEyeRoadLastColTurn = drawIndexResult[4];
            return [drawIndexResult[0], drawIndexResult[1], result];
        }
        return [-1, -1, -1];
    }


    /**
     * 添加小路
     * @param newMarker  1=庄，2=闲，3=和
     * @return
     */
    addSmallRoad(newMarker) {
        if (newMarker === 3) {// 为和时不画
            return [-1, -1, -1];
        }
        let roadType = 3;
        if (this._isStart(roadType)) {
            let result = 0; // 1=红，2=蓝
            if (this.bigRoadLastRow === 0) {
                this.smallRoadBeforeIsNull = false;
                result = this._isNeatResult(roadType);
            } else {
                result = this._towAndOtherResult(roadType);

            }
            let drawIndexResult = this._getDrawIndex(roadType, result);
            if (this.smallRoad[drawIndexResult[0]] === undefined) {
                this.smallRoad[drawIndexResult[0]] = [0, 0, 0, 0, 0, 0];
            }
            this.smallRoad[drawIndexResult[0]][drawIndexResult[1]] = result;
            this.smallRoadLastCol = drawIndexResult[2];
            this.smallRoadLastRow = drawIndexResult[3];
            this.smallRoadLastColTurn = drawIndexResult[4];
            return [drawIndexResult[0], drawIndexResult[1], result];
        }
        return [-1, -1, -1];
    }


    /**
     * 添加曱甴路
     * @param newMarker  1=庄，2=闲，3=和
     * @return
     */
    addCockroachRoad(newMarker) {
        if (newMarker === 3) {// 为和时不画
            return [-1, -1, -1];
        }
        let roadType = 4;
        if (this._isStart(roadType)) {
            let result = 0; // 1=红，2=蓝
            if (this.bigRoadLastRow === 0) {
                this.cockroachRoadBeforeIsNull = false;
                result = this._isNeatResult(roadType);
            } else {
                result = this._towAndOtherResult(roadType);

            }
            let drawIndexResult = this._getDrawIndex(roadType, result);
            if (this.cockroachRoad[drawIndexResult[0]] === undefined) {
                this.cockroachRoad[drawIndexResult[0]] = [0, 0, 0, 0, 0, 0];
            }
            this.cockroachRoad[drawIndexResult[0]][drawIndexResult[1]] = result;
            this.cockroachRoadLastCol = drawIndexResult[2];
            this.cockroachRoadLastRow = drawIndexResult[3];
            this.cockroachRoadLastColTurn = drawIndexResult[4];
            return [drawIndexResult[0], drawIndexResult[1], result];
        }
        return [-1, -1, -1];
    }

    /**
     * 获取绘画Index
     * @param roadType 1=Big Eye Road, 2=Small Road ,3=Cockroach Road
     * @param result
     * @return
     */
    _getDrawIndex(roadType, result) {
        let road;
        let roadLastCol = 0;
        let roadLastRow = 0;
        let roadLastColTurn = 0;
        switch (roadType) {
            case 2:
                road = this.bigEyeRoad;
                roadLastCol = this.bigEyeRoadLastCol;
                roadLastRow = this.bigEyeRoadLastRow;
                roadLastColTurn = this.bigEyeRoadLastColTurn;
                break;
            case 3:
                road = this.smallRoad;
                roadLastCol = this.smallRoadLastCol;
                roadLastRow = this.smallRoadLastRow;
                roadLastColTurn = this.smallRoadLastColTurn;
                break;
            case 4:
                road = this.cockroachRoad;
                roadLastCol = this.cockroachRoadLastCol;
                roadLastRow = this.cockroachRoadLastRow;
                roadLastColTurn = this.cockroachRoadLastColTurn;
                break;
        }
        if (road[roadLastCol] === undefined) {
            road[roadLastCol] = [0, 0, 0, 0, 0, 0];
        }
        if (road[roadLastCol][roadLastRow] !== 0) {
            if (road[roadLastCol][roadLastRow] === result) {
                // 同色
                if (roadLastColTurn >= 0) {
                    // 转弯
                    roadLastColTurn++;
                } else if (roadLastRow < 5 && road[roadLastCol][roadLastRow + 1] === 0) {
                    // 下方有空位
                    roadLastRow++;
                } else {
                    // 首次转弯
                    roadLastColTurn = roadLastCol;
                    roadLastColTurn++;
                }
            } else {
                // 不同颜色换列
                roadLastColTurn = -1;
                roadLastCol++;
                roadLastRow = 0;
            }
        }

        let drawCol = roadLastCol;
        let drawRow = roadLastRow;
        if (roadLastColTurn >= 0) {
            drawCol = roadLastColTurn;
        }
        return [drawCol, drawRow, roadLastCol, roadLastRow, roadLastColTurn];
    }

    /**
     * 是否开始绘画
     * @param roadType 2=Big Eye Road, 3=Small Road ,4=Cockroach Road
     * @return
     */
    _isStart(roadType) {
        if (roadType === 2) {// 大眼仔
            // 大眼仔：大路第二列的第一手牌之后
            if (!this.startBigEyeRoad
                && (this.bigRoadLastCol > 1 || (this.bigRoadLastCol === 1 && this.bigRoadLastRow === 1))) {
                this.startBigEyeRoad = true;
            }
            return this.startBigEyeRoad;
        } else if (roadType === 3) {
            // 小路：大路第三列的第一手牌之后
            if (!this.startSmallRoad
                && (this.bigRoadLastCol > 2 || (this.bigRoadLastCol === 2 && this.bigRoadLastRow === 1))) {
                this.startSmallRoad = true;
            }
            return this.startSmallRoad;
        } else if (roadType === 4) {
            // 曱甴路：大路第四列的第一手牌之后
            if (!this.startCockroachRoad
                && (this.bigRoadLastCol > 3 || (this.bigRoadLastCol === 3 && this.bigRoadLastRow === 1))) {
                this.startCockroachRoad = true;
            }
            return this.startCockroachRoad;
        }
        return false;
    }

    /**
     * 是否整齐
     * @param roadType 2=Big Eye Road, 3=Small Road ,4=Cockroach Road
     * @return
     */
    _isNeatResult(roadType) {
        let frontBColumnIndex = -100;
        switch (roadType) {
            case 2:
                frontBColumnIndex = 2;
                break;
            case 3:
                frontBColumnIndex = 3;
                break;
            case 4:
                frontBColumnIndex = 4;
                break;
        }

        let isNeat = true; // 是否整齐
        // 粒子位于第一行，比较前两列整齐为红，不整齐为蓝。
        let frontAColumnCount = 1;
        let frontBColumnCount = 1;
        for (let i = 1; i < 6; i++) {
            if (this.bigRoad[this.bigRoadLastCol - 1][i] === 0) {
                break; // 为空时跳出累加
            } else if (this.bigRoad[this.bigRoadLastCol - 1][0] % 10 !== this.bigRoad[this.bigRoadLastCol - 1][i] % 10) {
                isNeat = false; // 上下粒子不相同
                break;
            }
            frontAColumnCount++;
        }
        for (let i = 1; i < 6; i++) {
            if (this.bigRoad[this.bigRoadLastCol - frontBColumnIndex][i] === 0) {
                break; // 为空时跳出累加
            } else if (this.bigRoad[this.bigRoadLastCol - frontBColumnIndex][0] % 10 !== this.bigRoad[this.bigRoadLastCol
            - frontBColumnIndex][i] % 10) {
                isNeat = false; // 上下粒子不相同
                break;
            }
            frontBColumnCount++;
        }
        if (frontAColumnCount !== frontBColumnCount) {
            isNeat = false;// 数量不对不齐整
        }
        return isNeat ? 1 : 2;
    }


    /**
     * 第二行及之后行的结果
     * @param roadType
     * @return
     */
    _towAndOtherResult(roadType) {
        let beforeIsNullIndex = -100;
        let beforeIsNull = false;
        switch (roadType) {
            case 2:
                beforeIsNullIndex = 1;
                beforeIsNull = this.bigEyeRoadBeforeIsNull;
                break;
            case 3:
                beforeIsNullIndex = 2;
                beforeIsNull = this.smallRoadBeforeIsNull;
                break;
            case 4:
                beforeIsNullIndex = 3;
                beforeIsNull = this.cockroachRoadBeforeIsNull;
                break;
        }

        let result = -1;
        // 粒子位于第二行及以下等，比较该粒前面有粒为红，无粒为蓝，除了连续前面无粒，从第二个前无粒开始直落为红即可。
        if (beforeIsNull) {
            // 从第二个前无粒开始直落为红即可。
            result = 1;
        } else if (this.bigRoad[this.bigRoadLastCol - beforeIsNullIndex][this.bigRoadLastRow] === 0) {
            // 该粒前面无粒为蓝
            result = 2;

            switch (roadType) {
                case 2:
                    this.bigEyeRoadBeforeIsNull = true;
                    break;
                case 3:
                    this.smallRoadBeforeIsNull = true;
                    break;
                case 4:
                    this.cockroachRoadBeforeIsNull = true;
                    break;
            }
        } else {
            // 该粒前面有粒为红
            result = 1;
        }
        return result;
    }
}