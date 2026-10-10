/**
 * MeteorologicalCard.ets
 * 
 * 华为鸿蒙 HarmonyOS ArkUI (ArkTS) 气象卡片组件实现
 * 
 * 映射对应关系 (有迹可循，拒绝空谈)：
 * 1. 容器：Column() + constraintSize({ maxWidth: 388 }) + borderRadius(20) + linearGradient
 * 2. 边框分割线：Divider().color('rgba(255, 255, 255, 0.08)')
 * 3. 矢量图标：resources/base/media/*.svg，通过 Image($r('app.media.icon_name')) 加载
 * 4. 文本对齐：Row() { Text().fontSize(20).fontWeight(FontWeight.Bold); Text().fontSize(14) }.alignItems(VerticalAlign.Bottom)
 */

@Component
export struct MeteorologicalCard {
  @Prop title: string = '气象信息'
  @Prop windSpeed: string = '4.5'
  @Prop windSpeedUnit: string = 'm/s'
  @Prop sigWaveHeight: string = '0.2'
  @Prop sigWaveHeightUnit: string = 'm'
  @Prop waveHeight: string = '0.2'
  @Prop waveHeightUnit: string = 'm'
  @Prop wavePeriod: string = '3.0'
  @Prop wavePeriodUnit: string = 's'
  @Prop swellHeight: string = '0.1'
  @Prop swellHeightUnit: string = 'm'
  @Prop swellDirection: string = 'ENE'
  @Prop swellPeriod: string = '3.5'
  @Prop swellPeriodUnit: string = 's'
  @Prop currentSpeed: string = '0.2'
  @Prop currentSpeedUnit: string = 'kn'
  @Prop currentDirection: string = 'NE'
  
  onClose?: () => void

  build() {
    Column() {
      // Header 标题栏 (70vp)
      Row() {
        Text(this.title)
          .fontSize(20)
          .fontWeight(FontWeight.Medium)
          .fontColor(Color.White)
        
        Button() {
          Image($r('app.media.close'))
            .width(14)
            .height(14)
            .fillColor('#BBC3C9')
        }
        .type(ButtonType.Normal)
        .backgroundColor(Color.Transparent)
        .onClick(() => {
          if (this.onClose) this.onClose()
        })
      }
      .width('100%')
      .height(70)
      .padding({ left: 24, right: 24 })
      .justifyContent(FlexAlign.SpaceBetween)

      Divider().color('rgba(255, 255, 255, 0.08)').strokeWidth(1)

      // Row 1: 风向风速 (40vp)
      Row() {
        Row({ space: 10 }) {
          Image($r('app.media.wind')).width(14).height(14).fillColor(Color.White)
          Text('风向风速').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
        }
        Row({ space: 6 }) {
          Text(this.windSpeed).fontSize(20).fontWeight(FontWeight.Bold).fontColor(Color.White)
          Text(this.windSpeedUnit).fontSize(14).fontColor('#BBC3C9')
        }.alignItems(VerticalAlign.Bottom)
      }
      .width('100%')
      .height(40)
      .padding({ left: 24, right: 24 })
      .justifyContent(FlexAlign.SpaceBetween)

      Divider().color('rgba(255, 255, 255, 0.08)').strokeWidth(1)

      // Row 2: 有效波高 (40vp, 与下层相融无下分割线)
      Row() {
        Row({ space: 10 }) {
          Image($r('app.media.wave')).width(14).height(14).fillColor(Color.White)
          Text('有效波高').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
        }
        Row({ space: 6 }) {
          Text(this.sigWaveHeight).fontSize(20).fontWeight(FontWeight.Bold).fontColor(Color.White)
          Text(this.sigWaveHeightUnit).fontSize(14).fontColor('#BBC3C9')
        }.alignItems(VerticalAlign.Bottom)
      }
      .width('100%')
      .height(40)
      .padding({ left: 24, right: 24 })
      .justifyContent(FlexAlign.SpaceBetween)

      // Row 3: 双列网格 (风浪高度 / 平均周期) (69vp)
      Row() {
        // Col 1: 风浪高度
        Column() {
          Row({ space: 10 }) {
            Image($r('app.media.wave')).width(14).height(14).fillColor(Color.White)
            Text('风浪高度').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
          }
          Row({ space: 4 }) {
            Text(this.waveHeight).fontSize(20).fontWeight(FontWeight.Bold).fontColor(Color.White)
            Text(this.waveHeightUnit).fontSize(14).fontColor('#BBC3C9')
          }.margin({ top: 4, left: 24 }).alignItems(VerticalAlign.Bottom)
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)

        Divider().vertical(true).height(44).color('rgba(255, 255, 255, 0.08)').strokeWidth(1)

        // Col 2: 平均周期
        Column() {
          Row({ space: 10 }) {
            Image($r('app.media.calendar')).width(14).height(14).fillColor(Color.White)
            Text('平均周期').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
          }
          Row({ space: 4 }) {
            Text(this.wavePeriod).fontSize(20).fontWeight(FontWeight.Bold).fontColor(Color.White)
            Text(this.wavePeriodUnit).fontSize(14).fontColor('#BBC3C9')
          }.margin({ top: 4, left: 24 }).alignItems(VerticalAlign.Bottom)
        }
        .layoutWeight(1)
        .padding({ left: 24 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .height(69)
      .padding({ left: 24, right: 24 })

      Divider().color('rgba(255, 255, 255, 0.08)').strokeWidth(1)

      // Row 4: 三列网格 (涌高 / 涌向 / 平均周期) (68vp)
      Row() {
        // Col 1: 涌高
        Column() {
          Row({ space: 6 }) {
            Image($r('app.media.wave')).width(14).height(14).fillColor(Color.White)
            Text('涌高').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
          }
          Row({ space: 4 }) {
            Text(this.swellHeight).fontSize(20).fontWeight(FontWeight.Bold).fontColor(Color.White)
            Text(this.swellHeightUnit).fontSize(14).fontColor('#BBC3C9')
          }.margin({ top: 4, left: 20 }).alignItems(VerticalAlign.Bottom)
        }
        .width(104)
        .alignItems(HorizontalAlign.Start)

        Divider().vertical(true).height(44).color('rgba(255, 255, 255, 0.08)').strokeWidth(1)

        // Col 2: 涌向
        Column() {
          Row({ space: 6 }) {
            Image($r('app.media.arrow')).width(14).height(14).fillColor(Color.White)
            Text('涌向').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
          }
          Text(this.swellDirection)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
            .margin({ top: 4, left: 20 })
        }
        .width(120)
        .padding({ left: 16 })
        .alignItems(HorizontalAlign.Start)

        Divider().vertical(true).height(44).color('rgba(255, 255, 255, 0.08)').strokeWidth(1)

        // Col 3: 平均周期
        Column() {
          Row({ space: 6 }) {
            Image($r('app.media.calendar')).width(14).height(14).fillColor(Color.White)
            Text('平均周期').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
          }
          Row({ space: 4 }) {
            Text(this.swellPeriod).fontSize(20).fontWeight(FontWeight.Bold).fontColor(Color.White)
            Text(this.swellPeriodUnit).fontSize(14).fontColor('#BBC3C9')
          }.margin({ top: 4, left: 20 }).alignItems(VerticalAlign.Bottom)
        }
        .layoutWeight(1)
        .padding({ left: 16 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .height(68)
      .padding({ left: 24, right: 24 })

      Divider().color('rgba(255, 255, 255, 0.08)').strokeWidth(1)

      // Row 5: 双列网格 (流速 / 流向) (73vp)
      Row() {
        // Col 1: 流速
        Column() {
          Row({ space: 10 }) {
            Image($r('app.media.flow')).width(14).height(14).fillColor(Color.White)
            Text('流速').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
          }
          Row({ space: 4 }) {
            Text(this.currentSpeed).fontSize(20).fontWeight(FontWeight.Bold).fontColor(Color.White)
            Text(this.currentSpeedUnit).fontSize(14).fontColor('#BBC3C9')
          }.margin({ top: 4, left: 24 }).alignItems(VerticalAlign.Bottom)
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)

        Divider().vertical(true).height(44).color('rgba(255, 255, 255, 0.08)').strokeWidth(1)

        // Col 2: 流向
        Column() {
          Row({ space: 10 }) {
            Image($r('app.media.arrow')).width(14).height(14).fillColor(Color.White)
            Text('流向').fontSize(14).fontColor('rgba(255, 255, 255, 0.9)')
          }
          Text(this.currentDirection)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
            .margin({ top: 4, left: 24 })
        }
        .layoutWeight(1)
        .padding({ left: 24 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .height(73)
      .padding({ left: 24, right: 24 })
    }
    .width('100%')
    .constraintSize({ maxWidth: 388, minHeight: 360 })
    .borderRadius(20)
    .border({ width: 1, color: 'rgba(108, 111, 127, 0.4)' })
    .linearGradient({
      angle: 135,
      colors: [
        ['rgba(32, 37, 54, 0.95)', 0.0],
        ['rgba(14, 16, 25, 0.98)', 1.0]
      ]
    })
    .backgroundBlurStyle(BlurStyle.Thin)
    .shadow({ radius: 24, color: 'rgba(0, 0, 0, 0.4)', offsetY: 8 })
  }
}
