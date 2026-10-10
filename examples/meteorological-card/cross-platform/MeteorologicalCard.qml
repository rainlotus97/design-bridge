import QtQuick 2.15
import QtQuick.Layouts 1.15

/**
 * MeteorologicalCard.qml
 * 
 * Qt Quick / QML 气象卡片组件实现
 * 
 * 映射对应关系 (有迹可循，拒绝空谈)：
 * 1. 容器：Rectangle + Layout.maximumWidth: 388 + radius: 20 + Gradient
 * 2. 边框分割线：Rectangle { height: 1; color: "rgba(255, 255, 255, 0.08)" }
 * 3. 矢量图标：icons/*.svg，通过 Image { source: "../icons/wind.svg"; sourceSize: Qt.size(14, 14) } 加载
 * 4. 文本对齐：RowLayout { Text { font.pixelSize: 20; font.bold: true }; Text { font.pixelSize: 14 } }
 */

Rectangle {
    id: root
    width: 388
    implicitHeight: 360
    radius: 20
    border.color: Qt.rgba(108/255, 111/255, 127/255, 0.4)
    border.width: 1

    // 属性暴露与可变插槽 (Props & Mutability)
    property string cardTitle: "气象信息"
    property string windSpeed: "4.5"
    property string windSpeedUnit: "m/s"
    property string sigWaveHeight: "0.2"
    property string sigWaveHeightUnit: "m"
    property string waveHeight: "0.2"
    property string waveHeightUnit: "m"
    property string wavePeriod: "3.0"
    property string wavePeriodUnit: "s"
    property string swellHeight: "0.1"
    property string swellHeightUnit: "m"
    property string swellDirection: "ENE"
    property string swellPeriod: "3.5"
    property string swellPeriodUnit: "s"
    property string currentSpeed: "0.2"
    property string currentSpeedUnit: "kn"
    property string currentDirection: "NE"
    property string iconsPath: "../icons"

    signal closeClicked()

    // 表面渐变背景
    gradient: Gradient {
        orientation: Gradient.Diagonal
        GradientStop { position: 0.0; color: Qt.rgba(32/255, 37/255, 54/255, 0.95) }
        GradientStop { position: 1.0; color: Qt.rgba(14/255, 16/255, 25/255, 0.98) }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // Header 标题栏 (70px)
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 70
            Layout.leftMargin: 24
            Layout.rightMargin: 24

            Text {
                text: root.cardTitle
                color: "#FFFFFF"
                font.pixelSize: 20
                font.weight: Font.DemiBold
                Layout.alignment: Qt.AlignVCenter
            }

            Item { Layout.fillWidth: true }

            MouseArea {
                width: 24
                height: 24
                cursorShape: Qt.PointingHandCursor
                onClicked: root.closeClicked()

                Image {
                    anchors.centerIn: parent
                    source: root.iconsPath + "/close.svg"
                    sourceSize: Qt.size(14, 14)
                }
            }
        }

        // 分割线 1
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: Qt.rgba(1, 1, 1, 0.08)
        }

        // Row 1: 风向风速 (40px)
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 40
            Layout.leftMargin: 24
            Layout.rightMargin: 24

            RowLayout {
                spacing: 10
                Image {
                    source: root.iconsPath + "/wind.svg"
                    sourceSize: Qt.size(14, 14)
                }
                Text {
                    text: "风向风速"
                    color: Qt.rgba(1, 1, 1, 0.9)
                    font.pixelSize: 14
                }
            }

            Item { Layout.fillWidth: true }

            RowLayout {
                spacing: 6
                Text {
                    text: root.windSpeed
                    color: "#FFFFFF"
                    font.pixelSize: 20
                    font.bold: true
                }
                Text {
                    text: root.windSpeedUnit
                    color: "#BBC3C9"
                    font.pixelSize: 14
                    Layout.alignment: Qt.AlignBaseline
                }
            }
        }

        // 分割线 2
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: Qt.rgba(1, 1, 1, 0.08)
        }

        // Row 2: 有效波高 (40px, 与下层相融无下分割线)
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 40
            Layout.leftMargin: 24
            Layout.rightMargin: 24

            RowLayout {
                spacing: 10
                Image {
                    source: root.iconsPath + "/wave.svg"
                    sourceSize: Qt.size(14, 14)
                }
                Text {
                    text: "有效波高"
                    color: Qt.rgba(1, 1, 1, 0.9)
                    font.pixelSize: 14
                }
            }

            Item { Layout.fillWidth: true }

            RowLayout {
                spacing: 6
                Text {
                    text: root.sigWaveHeight
                    color: "#FFFFFF"
                    font.pixelSize: 20
                    font.bold: true
                }
                Text {
                    text: root.sigWaveHeightUnit
                    color: "#BBC3C9"
                    font.pixelSize: 14
                    Layout.alignment: Qt.AlignBaseline
                }
            }
        }

        // Row 3: 双列网格 (风浪高度 / 平均周期) (69px)
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 69
            Layout.leftMargin: 24
            Layout.rightMargin: 24

            // Col 1: 风浪高度
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 4

                RowLayout {
                    spacing: 10
                    Image {
                        source: root.iconsPath + "/wave.svg"
                        sourceSize: Qt.size(14, 14)
                    }
                    Text {
                        text: "风浪高度"
                        color: Qt.rgba(1, 1, 1, 0.9)
                        font.pixelSize: 14
                    }
                }
                RowLayout {
                    Layout.leftMargin: 24
                    spacing: 4
                    Text {
                        text: root.waveHeight
                        color: "#FFFFFF"
                        font.pixelSize: 20
                        font.bold: true
                    }
                    Text {
                        text: root.waveHeightUnit
                        color: "#BBC3C9"
                        font.pixelSize: 14
                        Layout.alignment: Qt.AlignBaseline
                    }
                }
            }

            // 居中分割竖线 (44px)
            Rectangle {
                width: 1
                preferredHeight: 44
                color: Qt.rgba(1, 1, 1, 0.08)
                Layout.alignment: Qt.AlignVCenter
            }

            // Col 2: 平均周期
            ColumnLayout {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                spacing: 4

                RowLayout {
                    spacing: 10
                    Image {
                        source: root.iconsPath + "/calendar.svg"
                        sourceSize: Qt.size(14, 14)
                    }
                    Text {
                        text: "平均周期"
                        color: Qt.rgba(1, 1, 1, 0.9)
                        font.pixelSize: 14
                    }
                }
                RowLayout {
                    Layout.leftMargin: 24
                    spacing: 4
                    Text {
                        text: root.wavePeriod
                        color: "#FFFFFF"
                        font.pixelSize: 20
                        font.bold: true
                    }
                    Text {
                        text: root.wavePeriodUnit
                        color: "#BBC3C9"
                        font.pixelSize: 14
                        Layout.alignment: Qt.AlignBaseline
                    }
                }
            }
        }

        // 分割线 3
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: Qt.rgba(1, 1, 1, 0.08)
        }

        // Row 4: 三列网格 (涌高 / 涌向 / 平均周期) (68px)
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 68
            Layout.leftMargin: 24
            Layout.rightMargin: 24

            // Col 1: 涌高
            ColumnLayout {
                Layout.preferredWidth: 104
                spacing: 4
                RowLayout {
                    spacing: 6
                    Image {
                        source: root.iconsPath + "/wave.svg"
                        sourceSize: Qt.size(14, 14)
                    }
                    Text {
                        text: "涌高"
                        color: Qt.rgba(1, 1, 1, 0.9)
                        font.pixelSize: 14
                    }
                }
                RowLayout {
                    Layout.leftMargin: 20
                    spacing: 4
                    Text {
                        text: root.swellHeight
                        color: "#FFFFFF"
                        font.pixelSize: 20
                        font.bold: true
                    }
                    Text {
                        text: root.swellHeightUnit
                        color: "#BBC3C9"
                        font.pixelSize: 14
                        Layout.alignment: Qt.AlignBaseline
                    }
                }
            }

            Rectangle {
                width: 1
                preferredHeight: 44
                color: Qt.rgba(1, 1, 1, 0.08)
                Layout.alignment: Qt.AlignVCenter
            }

            // Col 2: 涌向
            ColumnLayout {
                Layout.preferredWidth: 120
                Layout.leftMargin: 16
                spacing: 4
                RowLayout {
                    spacing: 6
                    Image {
                        source: root.iconsPath + "/arrow.svg"
                        sourceSize: Qt.size(14, 14)
                    }
                    Text {
                        text: "涌向"
                        color: Qt.rgba(1, 1, 1, 0.9)
                        font.pixelSize: 14
                    }
                }
                Text {
                    Layout.leftMargin: 20
                    text: root.swellDirection
                    color: "#FFFFFF"
                    font.pixelSize: 20
                    font.bold: true
                }
            }

            Rectangle {
                width: 1
                preferredHeight: 44
                color: Qt.rgba(1, 1, 1, 0.08)
                Layout.alignment: Qt.AlignVCenter
            }

            // Col 3: 平均周期
            ColumnLayout {
                Layout.fillWidth: true
                Layout.leftMargin: 16
                spacing: 4
                RowLayout {
                    spacing: 6
                    Image {
                        source: root.iconsPath + "/calendar.svg"
                        sourceSize: Qt.size(14, 14)
                    }
                    Text {
                        text: "平均周期"
                        color: Qt.rgba(1, 1, 1, 0.9)
                        font.pixelSize: 14
                    }
                }
                RowLayout {
                    Layout.leftMargin: 20
                    spacing: 4
                    Text {
                        text: root.swellPeriod
                        color: "#FFFFFF"
                        font.pixelSize: 20
                        font.bold: true
                    }
                    Text {
                        text: root.swellPeriodUnit
                        color: "#BBC3C9"
                        font.pixelSize: 14
                        Layout.alignment: Qt.AlignBaseline
                    }
                }
            }
        }

        // 分割线 4
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: Qt.rgba(1, 1, 1, 0.08)
        }

        // Row 5: 双列网格 (流速 / 流向) (73px)
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 73
            Layout.leftMargin: 24
            Layout.rightMargin: 24

            ColumnLayout {
                Layout.fillWidth: true
                spacing: 4
                RowLayout {
                    spacing: 10
                    Image {
                        source: root.iconsPath + "/flow.svg"
                        sourceSize: Qt.size(14, 14)
                    }
                    Text {
                        text: "流速"
                        color: Qt.rgba(1, 1, 1, 0.9)
                        font.pixelSize: 14
                    }
                }
                RowLayout {
                    Layout.leftMargin: 24
                    spacing: 4
                    Text {
                        text: root.currentSpeed
                        color: "#FFFFFF"
                        font.pixelSize: 20
                        font.bold: true
                    }
                    Text {
                        text: root.currentSpeedUnit
                        color: "#BBC3C9"
                        font.pixelSize: 14
                        Layout.alignment: Qt.AlignBaseline
                    }
                }
            }

            Rectangle {
                width: 1
                preferredHeight: 44
                color: Qt.rgba(1, 1, 1, 0.08)
                Layout.alignment: Qt.AlignVCenter
            }

            ColumnLayout {
                Layout.fillWidth: true
                Layout.leftMargin: 24
                spacing: 4
                RowLayout {
                    spacing: 10
                    Image {
                        source: root.iconsPath + "/arrow.svg"
                        sourceSize: Qt.size(14, 14)
                    }
                    Text {
                        text: "流向"
                        color: Qt.rgba(1, 1, 1, 0.9)
                        font.pixelSize: 14
                    }
                }
                Text {
                    Layout.leftMargin: 24
                    text: root.currentDirection
                    color: "#FFFFFF"
                    font.pixelSize: 20
                    font.bold: true
                }
            }
        }
    }
}
